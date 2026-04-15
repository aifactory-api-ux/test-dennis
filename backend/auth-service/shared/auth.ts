import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';

export function generateToken(payload: TokenPayload): string {
  // 7 days in seconds
  const expiresIn = 7 * 24 * 60 * 60;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function authMiddleware() {
  return (req: Request, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    try {
      const payload = verifyToken(token);
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
