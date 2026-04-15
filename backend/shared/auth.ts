import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  email?: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return authHeader;
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret) as TokenPayload;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'secret';
  const options: jwt.SignOptions = {
    expiresIn: '24h' as jwt.SignOptions['expiresIn']
  };
  return jwt.sign(payload, secret, options);
}

export function comparePassword(password: string, hash: string): boolean {
  const salt = hash.substring(0, 32);
  const hashMatch = hash.substring(32);
  const newHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return newHash === hashMatch;
}

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
