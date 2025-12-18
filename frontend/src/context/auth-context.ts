/**
 * Authentication Context Definition
 *
 * Provides authentication state and methods throughout the application.
 * Token is stored in memory only (React state), never in localStorage.
 */

import { createContext } from 'react';

export interface AuthContextType {
  /**
   * Current authentication state.
   * True if user has a valid token in memory.
   */
  isAuthenticated: boolean;

  /**
   * Loading state during initial session check.
   * True while attempting to restore session via /auth/refresh.
   */
  isLoading: boolean;

  /**
   * Current user email (from token payload).
   * Null if not authenticated.
   */
  userEmail: string | null;

  /**
   * Login method - stores token in memory and updates auth state.
   * Called after successful /auth/login.
   *
   * @param token - JWT access token
   * @param email - User email (optional, for display purposes)
   */
  login: (token: string) => void;

  /**
   * Logout method - clears token from memory and redirects to login.
   * Also triggers /auth/logout on backend to invalidate refresh token.
   */
  logout: () => void;

  /**
   * Get current access token from memory.
   * Used internally by TokenManager.
   *
   * @returns Current JWT access token or null
   */
  getToken: () => string | null;

  /**
   * Update access token in memory.
   * Used internally by TokenManager after refresh.
   *
   * @param token - New JWT access token
   */
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
