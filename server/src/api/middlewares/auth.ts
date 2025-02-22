import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        walletAddress: string;
      };
    }
  }
}

const authService = AuthService.getInstance();

export const authenticateWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const session = await authService.validateSession(token);
    req.user = { walletAddress: session.walletAddress };
    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
