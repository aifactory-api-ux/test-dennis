import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { login, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../../shared/auth';

const router = Router();

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const loginValidation = [
  body('email').isEmail().withMessage('Email must be a valid email'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  validateRequest
];

router.post('/login', loginValidation, login);
router.get('/me', authMiddleware(), getCurrentUser);

export default router;