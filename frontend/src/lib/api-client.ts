/**
 * Axios client with automatic JWT injection and refresh token rotation.
 *
 * Architecture:
 * - Base URL: /api/v1 (via Wrangler Proxy on localhost:8080)
 * - TokenManager: Singleton pattern for secure token management
 * - Request Interceptor: Injects Bearer token from memory
 * - Response Interceptor: Auto-refresh on 401 with queue to prevent race conditions
 * - Refresh Queue: Ensures only one /auth/refresh call at a time
 *
 * Features:
 * - No localStorage (token stored in React state via AuthProvider)
 * - Token rotation compatible (updates token after refresh)
 * - Retry logic prevents infinite loops
 * - Development logging for debugging
 */

import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';

const IS_DEV = import.meta.env.DEV;

// ============================================================================
// TOKEN MANAGER SINGLETON
// ============================================================================

/**
 * Manages token access and refresh callbacks.
 * Must be initialized by AuthProvider before any API calls.
 */
class TokenManager {
  private static instance: TokenManager;
  private getTokenFn: (() => string | null) | null = null;
  private setTokenFn: ((token: string | null) => void) | null = null;
  private onUnauthorizedFn: (() => void) | null = null;
  private isInitialized = false;

  private constructor() { }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Initialize the TokenManager with callbacks from AuthProvider.
   * Should be called once during app initialization.
   */
  initialize(
    getToken: () => string | null,
    setToken: (token: string | null) => void,
    onUnauthorized: () => void
  ): void {
    if (this.isInitialized) {
      if (IS_DEV) {
        console.warn('[TokenManager] Already initialized, ignoring duplicate call');
      }
      return;
    }

    this.getTokenFn = getToken;
    this.setTokenFn = setToken;
    this.onUnauthorizedFn = onUnauthorized;
    this.isInitialized = true;

    if (IS_DEV) {
      console.log('[TokenManager] Initialized successfully');
    }
  }

  getToken(): string | null {
    if (!this.isInitialized || !this.getTokenFn) {
      throw new Error('[TokenManager] Not initialized. Call initialize() in AuthProvider first.');
    }
    return this.getTokenFn();
  }

  setToken(token: string | null): void {
    if (!this.isInitialized || !this.setTokenFn) {
      throw new Error('[TokenManager] Not initialized. Call initialize() in AuthProvider first.');
    }
    this.setTokenFn(token);
  }

  triggerUnauthorized(): void {
    if (!this.isInitialized || !this.onUnauthorizedFn) {
      throw new Error('[TokenManager] Not initialized. Call initialize() in AuthProvider first.');
    }

    if (IS_DEV) {
      console.log('[TokenManager] Triggering unauthorized callback (logout)');
    }

    this.onUnauthorizedFn();
  }

  /**
   * Reset the manager (useful for testing).
   */
  reset(): void {
    this.getTokenFn = null;
    this.setTokenFn = null;
    this.onUnauthorizedFn = null;
    this.isInitialized = false;

    if (IS_DEV) {
      console.log('[TokenManager] Reset');
    }
  }
}

export const tokenManager = TokenManager.getInstance();

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

export const AXIOS_INSTANCE = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REFRESH TOKEN QUEUE
// ============================================================================

/**
 * Queue system to prevent multiple simultaneous refresh token requests.
 * When a 401 occurs during an active refresh, subsequent requests wait for the result.
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

/**
 * Add a callback to the queue. It will be called when the refresh completes.
 */
function subscribeTokenRefresh(callback: (token: string | null) => void): void {
  refreshSubscribers.push(callback);
}

/**
 * Notify all queued requests with the new token (or null if refresh failed).
 */
function onRefreshComplete(token: string | null): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// ============================================================================
// REQUEST INTERCEPTOR - Inject JWT Token
// ============================================================================

AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();

    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);

      if (IS_DEV) {
        console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url} (Token injected)`);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle 401 with Auto-Refresh
// ============================================================================

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    // Success responses pass through
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 Unauthorized errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Exclude /auth/login and /auth/refresh from retry logic
    const isLoginEndpoint = originalRequest.url?.includes('/auth/login');
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

    if (isLoginEndpoint || isRefreshEndpoint) {
      if (IS_DEV) {
        console.log('[Axios 401] Auth endpoint failed, not retrying');
      }
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (originalRequest._retry) {
      if (IS_DEV) {
        console.log('[Axios 401] Retry already attempted, rejecting');
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ========================================================================
    // REFRESH QUEUE LOGIC
    // ========================================================================

    if (isRefreshing) {
      // Another refresh is already in progress, queue this request
      if (IS_DEV) {
        console.log('[Axios 401] Refresh in progress, queuing request');
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string | null) => {
          if (newToken) {
            // Update the original request with the new token
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            resolve(AXIOS_INSTANCE(originalRequest));
          } else {
            // Refresh failed, reject this request
            reject(error);
          }
        });
      });
    }

    // Start a new refresh process
    isRefreshing = true;

    if (IS_DEV) {
      console.log('[Axios 401] Starting token refresh...');
    }

    try {
      // Attempt to refresh the token
      // The refreshToken cookie will be sent automatically by the browser
      const { data } = await axios.post<{ access_token: string; token_type: string }>(
        '/api/v1/auth/refresh',
        {},
        {
          withCredentials: true, // Ensure cookies are sent
        }
      );

      const newAccessToken = data.access_token;

      if (IS_DEV) {
        console.log('[Axios 401] Token refresh successful');
      }

      // Update token in memory via TokenManager
      tokenManager.setToken(newAccessToken);

      // Notify all queued requests
      onRefreshComplete(newAccessToken);

      // Retry the original request with the new token
      originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return AXIOS_INSTANCE(originalRequest);

    } catch (refreshError) {
      // Refresh failed (invalid/expired refresh token)
      if (IS_DEV) {
        console.error('[Axios 401] Token refresh failed', refreshError);
      }

      // Notify queued requests of failure
      onRefreshComplete(null);

      // Trigger logout via AuthProvider
      tokenManager.triggerUnauthorized();

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

// ============================================================================
// CUSTOM INSTANCE (Orval Compatibility)
// ============================================================================

/**
 * Custom Axios wrapper for Orval-generated API clients.
 * Adds cancellation support required by Orval.
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise for Orval compatibility
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
