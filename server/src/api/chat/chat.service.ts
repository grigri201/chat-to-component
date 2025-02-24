import { OpenAIClient } from '~/core/llm/openai/openaiClient';
import { basePrompt, hiPrompt, knownAssets } from '~/config/prompts';
import type { Session, ChatResponse } from '~/core/llm/openai/types';
import logger from '~/utils/logger';
import { parsePartialJson } from '~/utils/parsePartialJson';
import type OpenAI from 'openai';

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
          { role: 'system', content: basePrompt },
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
      session.messages.push({ role: 'system', content: basePrompt });
      session.messages.push({ role: 'system', content: hiPrompt });
      session.lastActivity = now;
      this.lastGreetings.set(user.walletAddress, now);
      
      logger.info(`Sent greeting to user: ${user.walletAddress}`);
      const stream = await this.openaiClient.createChatCompletion(session.messages);
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
    const stream = await this.openaiClient.createChatCompletion(session.messages);
    
    const processStream = async function* (stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
      let buffer = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        buffer += content;
        
        if (buffer.includes('{')) {
          try {
            const parsedJson = parsePartialJson(buffer);
            if (parsedJson) {
              yield {
                ...chunk,
                choices: [{
                  ...chunk.choices[0],
                  delta: { content: JSON.stringify(parsedJson, null, 2) }
                }]
              };
              buffer = ''; // Reset buffer after successful JSON parse
              continue;
            }
          } catch {}
        }
        
        if (content) {
          yield chunk;
        }
      }
      
      // Process any remaining content in buffer
      if (buffer) {
        try {
          const parsedJson = parsePartialJson(buffer);
          if (parsedJson) {
            const finalChunk: OpenAI.Chat.Completions.ChatCompletionChunk = {
              id: 'chatcmpl-final',
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-4',
              choices: [{
                index: 0,
                delta: { content: JSON.stringify(parsedJson, null, 2) },
                finish_reason: null
              }]
            };
            yield finalChunk;
          }
        } catch {}
      }
    };

    return { response: processStream(stream) };
  }

  async analyzeAsset(assetAddress: string, user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    const prompt = `Please analyze the asset at address ${assetAddress}`;
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Analyzing asset ${assetAddress} for user: ${user.walletAddress}`);
    const stream = await this.openaiClient.createChatCompletion(session.messages);
    
    const processStream = async function* (stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
      let buffer = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        buffer += content;
        
        if (buffer.includes('{')) {
          try {
            const parsedJson = parsePartialJson(buffer);
            if (parsedJson) {
              yield {
                ...chunk,
                choices: [{
                  ...chunk.choices[0],
                  delta: { content: JSON.stringify(parsedJson, null, 2) }
                }]
              };
              buffer = ''; // Reset buffer after successful JSON parse
              continue;
            }
          } catch {}
        }
        
        if (content) {
          yield chunk;
        }
      }
      
      // Process any remaining content in buffer
      if (buffer) {
        try {
          const parsedJson = parsePartialJson(buffer);
          if (parsedJson) {
            const finalChunk: OpenAI.Chat.Completions.ChatCompletionChunk = {
              id: 'chatcmpl-final',
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-4',
              choices: [{
                index: 0,
                delta: { content: JSON.stringify(parsedJson, null, 2) },
                finish_reason: null
              }]
            };
            yield finalChunk;
          }
        } catch {}
      }
    };

    return { response: processStream(stream) };
  }

  async analyzePortfolio(user: User): Promise<ChatResponse> {
    const session = this.getSession(user);
    const prompt = `Please analyze the portfolio for wallet ${user.walletAddress}`;
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    logger.info(`Analyzing portfolio for user: ${user.walletAddress}`);
    const stream = await this.openaiClient.createChatCompletion(session.messages);
    
    const processStream = async function* (stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
      let buffer = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        buffer += content;
        
        if (buffer.includes('{')) {
          try {
            const parsedJson = parsePartialJson(buffer);
            if (parsedJson) {
              yield {
                ...chunk,
                choices: [{
                  ...chunk.choices[0],
                  delta: { content: JSON.stringify(parsedJson, null, 2) }
                }]
              };
              buffer = ''; // Reset buffer after successful JSON parse
              continue;
            }
          } catch {}
        }
        
        if (content) {
          yield chunk;
        }
      }
      
      // Process any remaining content in buffer
      if (buffer) {
        try {
          const parsedJson = parsePartialJson(buffer);
          if (parsedJson) {
            const finalChunk: OpenAI.Chat.Completions.ChatCompletionChunk = {
              id: 'chatcmpl-final',
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-4',
              choices: [{
                index: 0,
                delta: { content: JSON.stringify(parsedJson, null, 2) },
                finish_reason: null
              }]
            };
            yield finalChunk;
          }
        } catch {}
      }
    };

    return { response: processStream(stream) };
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
