import { Router, type Request, type Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { authenticateWallet } from '../middlewares/auth';
import logger from '~/utils/logger';

const router = Router();
const portfolioService = PortfolioService.getInstance();

// Get open orders by type
router.get('/orders/:orderType', authenticateWallet, async (req: Request, res: Response) => {
    const { orderType } = req.params;
    const walletAddress = req.wallet; // From auth middleware

    if (!orderType) {
        res.status(400).json({ error: 'Order type is required' });
        return;
    }

    if (!['market', 'limit'].includes(orderType)) {
        res.status(400).json({ error: 'Invalid order type. Must be either "market" or "limit"' });
        return;
    }

    try {
        const orders = await portfolioService.getOpenOrders(walletAddress, orderType);
        res.json(orders);
    } catch (error: any) {
        logger.error('Error in get open orders endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
