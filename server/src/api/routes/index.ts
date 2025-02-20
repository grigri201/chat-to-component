import { Router } from 'express';
import { ChatService } from '~/api/services/chat.service';

const router = Router();
const chatService = new ChatService();

// 健康检查
router.get('/stats', (req, res) => {
  res.json(chatService.getStats());
});

// 完成请求
router.post('/completion', async (req, res) => {
  const { prompt, sessionId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { response: stream, sessionId: activeSessionId, isNew } = await chatService.completion(prompt, sessionId);
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    if (isNew) {
      res.write(`[[[${JSON.stringify({ type: "session", sessionId: activeSessionId })}]]]\n`);
    }
    res.end();
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

export { router };
