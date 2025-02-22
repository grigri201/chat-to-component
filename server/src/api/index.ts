import { Router } from 'express';
import { authRouter } from './auth/auth.route';
import { chatRouter } from './chat/chat.route';
import { assetRouter } from './asset/asset.route';

const router = Router();

// Mount module routers
router.use('/auth', authRouter);
router.use('/chat', chatRouter);
router.use('/assets', assetRouter);

export { router };
