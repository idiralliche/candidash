/**
 * Authentication Provider
 *
 * Features:
 * - In-memory token storage (no localStorage)
 * - Asynchronous session initialization via /auth/refresh
 * - TokenManager integration for axios interceptors
 * - Proper logout with backend cleanup
 * - JWT decoding for email extraction
 */

import { useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './auth-context';
import { tokenManager, AXIOS_INSTANCE } from '@/lib/api-client';

const IS_DEV = import.meta.env.DEV;

// ============================================================================
// JWT PAYLOAD INTERFACE
// ============================================================================

interface JWTPayload {
  sub: string;  // User email
  exp: number;  // Expiration timestamp
  type: string; // Token type ("access")
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract email from JWT token.
 * Does not validate signature (validation is done by backend).
 */
function extractEmailFromToken(token: string): string | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.sub;
  } catch {
    if (IS_DEV) {
      console.warn('[AuthProvider] Failed to decode token');
    }
    return null;
  }
}

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // =========================================================================
  // STATE
  // =========================================================================

  /**
   * Access token stored in memory only.
   * NEVER persisted to localStorage.
   */
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * User email extracted from JWT token.
   */
  const [userEmail, setUserEmail] = useState<string | null>(null);

  /**
   * Loading state during initial session check.
   * Prevents flash of login page while checking if user has valid refresh token.
   */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Computed authentication state.
   */
  const isAuthenticated = accessToken !== null;

  /**
   * Ref to prevent multiple simultaneous session initialization attempts.
   */
  const isInitializing = useRef(false);

  // =========================================================================
  // METHODS
  // =========================================================================

  /**
   * Login - Store token in memory and extract email from JWT.
   */
  const login = useCallback((token: string) => {
    const email = extractEmailFromToken(token);

    if (IS_DEV) {
      console.log('[AuthProvider] Login successful', { email });
    }

    setAccessToken(token);
    setUserEmail(email);
  }, []);

  /**
   * Logout - Clear state and call backend to invalidate refresh token.
   * Uses window.location.href to avoid RouterProvider dependency.
   */
  const logout = useCallback(async () => {
    if (IS_DEV) {
      console.log('[AuthProvider] Logging out...');
    }

    // Call backend to invalidate refresh token cookie
    try {
      await AXIOS_INSTANCE.post('/api/v1/auth/logout', {}, { withCredentials: true });
    } catch {
      // Logout on backend failed, but we still clean local state
      if (IS_DEV) {
        console.warn('[AuthProvider] Backend logout failed (continuing anyway)');
      }
    }

    // Clear local state
    setAccessToken(null);
    setUserEmail(null);

    // Redirect to login using window.location (hard reload, clean state)
    window.location.href = '/login';
  }, []);

  /**
   * Get current token (for TokenManager).
   */
  const getToken = useCallback((): string | null => {
    return accessToken;
  }, [accessToken]);

  /**
   * Set token (for TokenManager after refresh).
   */
  const setToken = useCallback((token: string | null) => {
    if (IS_DEV) {
      console.log('[AuthProvider] Token updated via TokenManager');
    }
    setAccessToken(token);

    // Extract email from new token
    if (token) {
      const email = extractEmailFromToken(token);
      setUserEmail(email);
    }
  }, []);

  // =========================================================================
  // SESSION INITIALIZATION
  // =========================================================================

  /**
   * Attempt to restore session on mount.
   * Tries to refresh access token using the httpOnly cookie.
   * If successful, user is automatically logged in.
   * If failed, user stays logged out (no redirect, just ready state).
   */
  useEffect(() => {
    const initializeSession = async () => {
      // Prevent duplicate initialization
      if (isInitializing.current) {
        return;
      }

      isInitializing.current = true;

      if (IS_DEV) {
        console.log('[AuthProvider] Initializing session...');
      }

      try {
        // Attempt to refresh token (cookie sent automatically)
        const { data } = await AXIOS_INSTANCE.post<{ access_token: string; token_type: string }>(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.access_token;

        if (IS_DEV) {
          console.log('[AuthProvider] Session restored successfully');
        }

        // Extract email from token
        const email = extractEmailFromToken(newAccessToken);

        // Set token and email in state (triggers re-render, user is authenticated)
        setAccessToken(newAccessToken);
        setUserEmail(email);

      } catch {
        // No valid refresh token (user is not logged in or session expired)
        if (IS_DEV) {
          console.log('[AuthProvider] No valid session found (user not logged in)');
        }

        // Stay logged out (do nothing, isAuthenticated = false)
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeSession();
  }, []);

  // =========================================================================
  // TOKEN MANAGER INTEGRATION
  // =========================================================================

  /**
   * Initialize TokenManager with callbacks.
   * This allows axios interceptors to access token and trigger logout.
   */
  useEffect(() => {
    tokenManager.initialize(getToken, setToken, logout);

    if (IS_DEV) {
      console.log('[AuthProvider] TokenManager initialized');
    }

    // Cleanup on unmount (useful for tests)
    return () => {
      if (IS_DEV) {
        console.log('[AuthProvider] Cleaning up TokenManager');
      }
      tokenManager.reset();
    };
  }, [getToken, setToken, logout]);

  // =========================================================================
  // RENDER
  // =========================================================================

  /**
   * Show loading state during initial session check.
   * Prevents flash of login page or protected content.
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16181d]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userEmail,
        login,
        logout,
        getToken,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
