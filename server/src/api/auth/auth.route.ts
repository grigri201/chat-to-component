import { Router, type Request, type Response, type NextFunction } from 'express';
import { AuthService } from './auth.service';
import logger from '~/utils/logger';

const router = Router();
const authService = AuthService.getInstance();

// 请求参数验证中间件
const validateWalletAddress = (req: Request, res: Response, next: NextFunction): void => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    logger.warn('Missing wallet address in request');
    res.status(400).json({ error: 'Wallet address is required' });
    return;
  }

  if (!authService.validateAddress(walletAddress)) {
    logger.warn(`Invalid wallet address format: ${walletAddress}`);
    res.status(400).json({ error: 'Invalid wallet address format' });
    return;
  }

  next();
};

// 生成 nonce
router.post('/nonce', validateWalletAddress, async (req: Request, res: Response): Promise<void> => {
  const { walletAddress } = req.body;
  
  try {
    const { nonce, expiresIn } = await authService.generateNonce(walletAddress);
    logger.info(`Generated nonce for wallet: ${walletAddress}`);
    res.json({ nonce, expiresIn });
  } catch (error: any) {
    logger.error('Error generating nonce:', { error: error.message, walletAddress });
    res.status(500).json({ error: error.message });
  }
});

// 验证签名
router.post('/verify', validateWalletAddress, async (req: Request, res: Response): Promise<void> => {
  const { walletAddress, signature } = req.body;

  if (!signature) {
    logger.warn('Missing signature in request');
    res.status(400).json({ error: 'Signature is required' });
    return;
  }

  try {
    const session = await authService.verifySignature(walletAddress, signature);
    logger.info(`Verified signature for wallet: ${walletAddress}`);
    res.json(session);
  } catch (error: any) {
    logger.error('Error verifying signature:', { error: error.message, walletAddress });
    
    // 根据错误类型返回不同的状态码
    if (error.message === 'No nonce found for this wallet address' || 
        error.message === 'Nonce has expired') {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message === 'Invalid signature') {
      res.status(401).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 验证会话
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    logger.warn('Missing token in request');
    res.status(400).json({ error: 'Session token is required' });
    return;
  }

  try {
    const session = await authService.validateSession(token);
    logger.info(`Validated session for wallet: ${session.walletAddress}`);
    res.json(session);
  } catch (error: any) {
    logger.error('Error validating session:', { error: error.message, token });
    
    if (error.message === 'Invalid session' || 
        error.message === 'Session expired') {
      res.status(401).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRouter };
