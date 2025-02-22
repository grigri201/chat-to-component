import { OpenAIClient } from '~/core/llm/openai/openaiClient';
import { generateCode, knownAssets } from '~/config/prompts';
import type { Session, ChatResponse } from '~/core/llm/openai/types';
import logger from '~/utils/logger';

interface User {
  walletAddress: string;
}

export class ChatService {
  private static instance: ChatService;
  private openaiClient: OpenAIClient;
  private sessions: Map<string, Session>;
  private lastGreetings: Map<string, Date>;
  private readonly GREETING_INTERVAL = 8 * 60 * 60 * 1000; // 8小时

  private constructor() {
    this.openaiClient = new OpenAIClient();
    this.sessions = new Map();
    this.lastGreetings = new Map();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private getSession(user: User): Session {
    if (!this.sessions.has(user.walletAddress)) {
      this.sessions.set(user.walletAddress, {
        messages: [
          { role: 'system', content: generateCode },
          { role: 'system', content: knownAssets },
        ],
        lastActivity: new Date(),
      });
    }
    return this.sessions.get(user.walletAddress)!;
  }

  async sayHi(user: User): Promise<ChatResponse> {
    const now = new Date();
    const lastGreeting = this.lastGreetings.get(user.walletAddress);
    
    if (!lastGreeting || (now.getTime() - lastGreeting.getTime() > this.GREETING_INTERVAL)) {
      const session = this.getSession(user);
      const greeting = `Hi! It's ${now.toLocaleTimeString()}. How can I help you today?`;
      
      session.messages.push({ role: 'assistant', content: greeting });
      session.lastActivity = now;
      this.lastGreetings.set(user.walletAddress, now);
      
      logger.info(`Sent greeting to user: ${user.walletAddress}`);
      const stream = await this.openaiClient.createChatCompletion([{ role: 'assistant', content: greeting }]);
      return { response: stream };
    }
    
    const stream = await this.openaiClient.createChatCompletion([{ role: 'assistant', content: '' }]);
    return { response: stream };
  }

  async completion(prompt: string, user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Processing completion request for user: ${user.walletAddress}`);
    const response = await this.openaiClient.createChatCompletion(session.messages);

    return { response };
  }

  async analyzeAsset(assetAddress: string, user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    const prompt = `Please analyze the asset at address ${assetAddress}`;
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Analyzing asset ${assetAddress} for user: ${user.walletAddress}`);
    const response = await this.openaiClient.createChatCompletion(session.messages);

    return { response };
  }

  async analyzePortfolio(user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    const prompt = `Please analyze the portfolio for wallet ${user.walletAddress}`;
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Analyzing portfolio for user: ${user.walletAddress}`);
    const response = await this.openaiClient.createChatCompletion(session.messages);

    return { response };
  }

  async placeOrder(user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    const prompt = 'Please help me place an order';
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Processing place order request for user: ${user.walletAddress}`);
    const response = await this.openaiClient.createChatCompletion(session.messages);

    return { response };
  }

  async cancelOrder(user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    const prompt = 'Please help me cancel my order';
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Processing cancel order request for user: ${user.walletAddress}`);
    const response = await this.openaiClient.createChatCompletion(session.messages);

    return { response };
  }

  getStats() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeSessions: this.sessions.size,
      activeGreetings: this.lastGreetings.size
    };
  }

  // 清理过期会话
  cleanupSessions(maxAge: number = 1000 * 60 * 60) { // 默认1小时过期
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(sessionId);
        this.lastGreetings.delete(sessionId);
        logger.info(`Cleaned up expired session for user: ${sessionId}`);
      }
    }
  }
}
