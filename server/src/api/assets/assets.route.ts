import { Router, type Request, type Response } from 'express';
import { AssetsService } from './assets.service';
import { authenticateWallet } from '../middlewares/auth';
import logger from '~/utils/logger';

const router = Router();
const assetsService = AssetsService.getInstance();

// Get asset overview
router.get('/overview/:assetAddresses', authenticateWallet, async (req: Request, res: Response) => {
  const { assetAddresses } = req.params;
  if (!assetAddresses) {
    res.status(400).json({ error: 'Asset address is required' });
    return;
  }
  try {
    const data = await assetsService.getAssetOverview(assetAddresses.split(','));
    res.json(data);
  } catch (error: any) {
    logger.error('Error in asset overview endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
