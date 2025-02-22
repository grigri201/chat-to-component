import { Router } from 'express';
import { AssetService } from './asset.service';
import { authenticateWallet } from '../middlewares/auth';

const router = Router();
const assetService = new AssetService();

router.get('/prices', authenticateWallet, async (req, res) => {
  try {
    const prices = await assetService.getLatestPrices();
    res.json(prices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:symbol/history', authenticateWallet, async (req, res) => {
  try {
    const { symbol } = req.params;
    const history = await assetService.getPriceHistory(symbol);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as assetRouter };
