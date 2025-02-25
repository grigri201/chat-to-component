import { Router } from 'express';
import { authRouter } from './auth/auth.route';
import { chatRouter } from './chat/chat.route';
import assetsRouter from './assets/assets.route';
import portfolioRouter from './portfolio/portfolio.route';

const router = Router();

// Mount module routers
router.use('/auth', authRouter);
router.use('/chat', chatRouter);
router.use('/assets', assetsRouter);
router.use('/portfolio', portfolioRouter);

export { router };
