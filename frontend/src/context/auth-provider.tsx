/**
 * Authentication Provider
 *
 * Features:
 * - In-memory token storage (no localStorage)
 * - Asynchronous session initialization via /auth/refresh
 * - TokenManager integration for axios interceptors
 * - Proper logout with backend cleanup
 * - JWT decoding for email extraction
 * - Uses useRef for immediate token access to prevent race conditions during initial load
 */

import { useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '@/context/auth-context';
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

interface TokenResponse {
  access_token: string;
  token_type: string;
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
  // STATE & REFS
  // =========================================================================

  /**
   * Access token stored in React State for UI reactivity.
   */
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  /**
   * Access token stored in Ref for IMMEDIATE synchronous access.
   * This solves the race condition where Axios interceptors need the token
   * before the React state update has propagated.
   */
  const accessTokenRef = useRef<string | null>(null);

  /**
   * User email extracted from JWT token.
   */
  const [userEmail, setUserEmail] = useState<string | null>(null);

  /**
   * Loading state during initial session check.
   */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Ref to prevent multiple simultaneous session initialization attempts.
   */
  const isInitializing = useRef(false);

  // =========================================================================
  // INTERNAL HELPERS
  // =========================================================================

  /**
   * Synchronized setter that updates both Ref (for logic) and State (for UI).
   */
  const setAccessToken = useCallback((token: string | null) => {
    // 1. Update Ref immediately - crucial for Axios interceptors
    accessTokenRef.current = token;
    // 2. Update State - triggers re-render
    setAccessTokenState(token);
  }, []);

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
  }, [setAccessToken]);

  /**
   * Logout - Clear state and call backend to invalidate refresh token.
   */
  const logout = useCallback(async () => {
    if (IS_DEV) {
      console.log('[AuthProvider] Logging out...');
    }

    // Call backend to invalidate refresh token cookie
    try {
      await AXIOS_INSTANCE.post('/api/v1/auth/logout', {}, { withCredentials: true });
    } catch {
      if (IS_DEV) {
        console.warn('[AuthProvider] Backend logout failed (continuing anyway)');
      }
    }

    // Clear local state
    setAccessToken(null);
    setUserEmail(null);

    // Redirect to login using window.location (hard reload, clean state)
    window.location.href = '/login';
  }, [setAccessToken]);

  /**
   * Get current token (for TokenManager).
   * Reads directly from Ref to ensure we always get the latest value,
   * avoiding stale closures in interceptors.
   */
  const getToken = useCallback((): string | null => {
    return accessTokenRef.current;
  }, []);

  /**
   * Set token (for TokenManager after refresh).
   */
  const setToken = useCallback((token: string | null) => {
    if (IS_DEV) {
      console.log('[AuthProvider] Token updated via TokenManager');
    }
    setAccessToken(token);

    if (token) {
      const email = extractEmailFromToken(token);
      setUserEmail(email);
    }
  }, [setAccessToken]);

  // =========================================================================
  // SESSION INITIALIZATION
  // =========================================================================

  useEffect(() => {
    const initializeSession = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;

      if (IS_DEV) {
        console.log('[AuthProvider] Initializing session...');
      }

      try {
        const { data } = await AXIOS_INSTANCE.post<TokenResponse>(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.access_token;

        if (IS_DEV) {
          console.log('[AuthProvider] Session restored successfully');
        }

        const email = extractEmailFromToken(newAccessToken);

        setAccessToken(newAccessToken);
        setUserEmail(email);

      } catch {
        if (IS_DEV) {
          console.log('[AuthProvider] No valid session found (user not logged in)');
        }
      } finally {
        setIsLoading(false);
        isInitializing.current = false;
      }
    };

    initializeSession();
  }, [setAccessToken]);

  // =========================================================================
  // TOKEN MANAGER INTEGRATION
  // =========================================================================

  useEffect(() => {
    tokenManager.initialize(getToken, setToken, logout);

    if (IS_DEV) {
      console.log('[AuthProvider] TokenManager initialized');
    }

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
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
        isAuthenticated: !!accessToken,
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
