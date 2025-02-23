import { Router } from 'express';
import { authRouter } from './auth/auth.route';
import { chatRouter } from './chat/chat.route';

const router = Router();

// Mount module routers
router.use('/auth', authRouter);
router.use('/chat', chatRouter);

export { router };
