/**
 * Auth utilities for opportunity-service
 * Shared JWT and authentication functionality
 * This file provides local access to shared auth utilities
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

export interface TokenPayload {
  userId: string;
  email?: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Extract JWT token from Authorization header
 * Supports both 'Bearer <token>' and raw token formats
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return authHeader;
}

/**
 * Verify JWT token and decode payload
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Will throw if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret) as TokenPayload;
}

/**
 * Generate JWT token from payload
 * @param payload - Token payload data
 * @returns Signed JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] });
}

/**
 * Compare plain password with bcrypt hash
 * @param plainPassword - Plain text password
 * @param hashedPassword - Bcrypt hashed password
 * @returns True if passwords match
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Hash password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  return bcrypt.hash(password, saltRounds);
}

/**
 * Express middleware for JWT authentication
 * Validates token from Authorization header and attaches user to request
 * 
 * @returns Express middleware function
 * 
 * Usage:
 * ```typescript
 * router.get('/protected', authMiddleware(), (req, res) => {
 *   const user = req.user;
 * });
 * ```
 */
export function authMiddleware() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

/**
 * Optional auth middleware - attaches user if token present but doesn't require it
 * Useful for endpoints that can work with or without authentication
 */
export function optionalAuthMiddleware() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch (err) {
        // Token invalid - continue without user (optional auth)
        req.user = undefined;
      }
    }
    
    next();
  };
}
