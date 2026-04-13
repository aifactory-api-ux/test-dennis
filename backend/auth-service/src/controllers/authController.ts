import { Request, Response } from 'express';
import { query } from '../../shared/db';
import { generateToken, comparePassword, TokenPayload, AuthenticatedRequest } from '../../shared/auth';
import { UserLoginRequest, UserLoginResponse, UserResponse } from '../../shared/types';

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

/**
 * Login endpoint handler
 * Validates credentials and returns JWT token
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: UserLoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Query user by email
    const result = await query<UserRow>(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email
    };

    const token = generateToken(tokenPayload);

    // Return response
    const response: UserLoginResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user"
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current authenticated user endpoint handler
 * Returns user information based on JWT token
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Query user by ID from token
    const result = await query<UserRow>(
      'SELECT id, email, name FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
        role: user.role || "user"
    };

    res.status(200).json(userResponse);
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
