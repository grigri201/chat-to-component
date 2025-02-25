import { Router, type Request, type Response } from 'express';
import { ChatService } from './chat.service';
import { authenticateWallet } from '../middlewares/auth';
import logger from '~/utils/logger';

const router = Router();
const chatService = ChatService.getInstance();

// 设置 SSE 响应头
const setSSEHeaders = (res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
};

// 处理流式响应
const handleStreamResponse = async (stream: any, res: Response) => {
  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      console.log("content: ", content)
      if (content) {
        res.write(content);
      }
    }
    res.end();
  } catch (error: any) {
    logger.error('Error in stream response:', error);
    res.status(500).json({ error: error.message });
  }
};

// 状态检查
router.get('/stats', (req: Request, res: Response) => {
  res.json(chatService.getStats());
});

// 问候消息
router.post('/hi', authenticateWallet, async (req: Request, res: Response) => {
  setSSEHeaders(res);
  try {
    const { response: stream } = await chatService.sayHi(req.user!);
    await handleStreamResponse(stream, res);
  } catch (error: any) {
    logger.error('Error in hi endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// 对话完成
router.post('/completion', authenticateWallet, async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  setSSEHeaders(res);
  try {
    const { response: stream } = await chatService.completion(prompt, req.user!);
    await handleStreamResponse(stream, res);
  } catch (error: any) {
    logger.error('Error in completion endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// 资产分析
router.get('/asset-overview/:assetAddress', authenticateWallet, async (req: Request, res: Response) => {
  const { assetAddress } = req.params;
  if (!assetAddress) {
    res.status(400).json({ error: 'Asset address is required' });
    return;
  }

  setSSEHeaders(res);
  try {
    const { response: stream } = await chatService.assetOverview(assetAddress, req.user!);
    await handleStreamResponse(stream, res);
  } catch (error: any) {
    logger.error('Error in asset overview endpoint:', error);
    res.status(500).send({ error: error.message });
  }
});

// 投资组合分析
router.get('/portfolio-analysis', authenticateWallet, async (req: Request, res: Response) => {
  setSSEHeaders(res);
  try {
    const { response: stream } = await chatService.analyzePortfolio(req.user!);
    await handleStreamResponse(stream, res);
  } catch (error: any) {
    logger.error('Error in portfolio analysis endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建订单
router.post('/place-order', authenticateWallet, async (req: Request, res: Response) => {
  setSSEHeaders(res);
  try {
    const { response: stream } = await chatService.placeOrder(req.user!);
    await handleStreamResponse(stream, res);
  } catch (error: any) {
    logger.error('Error in place order endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// 取消订单
router.post('/cancel-order', authenticateWallet, async (req: Request, res: Response) => {
  setSSEHeaders(res);
  try {
    const { response: stream } = await chatService.cancelOrder(req.user!);
    await handleStreamResponse(stream, res);
  } catch (error: any) {
    logger.error('Error in cancel order endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as chatRouter };
