/**
 * TypeScript types for User entities
 * Mirrors the backend types from SPEC.md and shared foundation
 */

/**
 * User entity representing a registered user in the system
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;
  /** User email address */
  email: string;
  /** User's full name */
  name: string;
  /** Hashed password (backend only, not exposed to frontend) */
  passwordHash: string;
  /** Account creation timestamp */
  createdAt: string;
}

/**
 * Request payload for user login
 */
export interface UserLoginRequest {
  /** User email address */
  email: string;
  /** User password (plaintext, sent to backend for verification) */
  password: string;
}

/**
 * Response payload after successful login
 */
export interface UserLoginResponse {
  /** JWT authentication token */
  token: string;
  /** Authenticated user information */
  user: {
    /** User unique identifier */
    id: string;
    /** User email address */
    email: string;
    /** User's full name */
    name: string;
  };
}

/**
 * User information response (typically from /api/auth/me)
 */
export interface UserResponse {
  /** User unique identifier */
  id: string;
  /** User email address */
  email: string;
  /** User's full name */
  name: string;
}

/**
 * Current authenticated user state
 */
export interface CurrentUser {
  /** User unique identifier */
  id: string;
  /** User email address */
  email: string;
  /** User's full name */
  name: string;
}

/**
 * Auth context type used in the application
 */
export interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: UserLoginRequest) => Promise<void>;
  logout: () => void;
}
