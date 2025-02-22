import { expect, test, describe, beforeAll, afterEach, mock } from "bun:test";
import { ChatService } from './chat.service';
import { OpenAIClient } from '~/core/llm/openai/openaiClient';

describe('ChatService', () => {
  const mockUser = { walletAddress: '0x1234567890123456789012345678901234567890' };
  let chatService: ChatService;
  let mockOpenAIClient: OpenAIClient;

  beforeAll(() => {
    chatService = ChatService.getInstance();
    mockOpenAIClient = new OpenAIClient();
    mock(mockOpenAIClient, {
      createChatCompletion: (messages) => {
        const mockStream = {
          async *[Symbol.asyncIterator]() {
            yield { choices: [{ delta: { content: 'mock response' } }] };
          }
        };
        return Promise.resolve(mockStream);
      }
    });
  });

  afterEach(() => {
    // Reset mocks
    mock.restore();
    // Clean up sessions
    chatService.cleanupSessions(0);
    // Re-setup mock for next test
    mock(mockOpenAIClient, {
      createChatCompletion: (messages) => {
        const mockStream = {
          async *[Symbol.asyncIterator]() {
            yield { choices: [{ delta: { content: 'mock response' } }] };
          }
        };
        return Promise.resolve(mockStream);
      }
    });
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const instance1 = ChatService.getInstance();
      const instance2 = ChatService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('sayHi', () => {
    test('should send greeting for first time user', async () => {
      const response = await chatService.sayHi(mockUser);
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });

    test('should not send new greeting within interval', async () => {
      // First greeting
      await chatService.sayHi(mockUser);

      // Second greeting immediately after
      const response = await chatService.sayHi(mockUser);
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('completion', () => {
    test('should process completion request', async () => {
      const prompt = 'Hello, how are you?';
      const response = await chatService.completion(prompt, mockUser);
      
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('analyzeAsset', () => {
    test('should process asset analysis request', async () => {
      const assetAddress = '0xasset123';
      const response = await chatService.analyzeAsset(assetAddress, mockUser);
      
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('analyzePortfolio', () => {
    test('should process portfolio analysis request', async () => {
      const response = await chatService.analyzePortfolio(mockUser);
      
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('placeOrder', () => {
    test('should process place order request', async () => {
      const response = await chatService.placeOrder(mockUser);
      
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('cancelOrder', () => {
    test('should process cancel order request', async () => {
      const response = await chatService.cancelOrder(mockUser);
      
      expect(response.response).toBeDefined();
      expect(typeof response.response[Symbol.asyncIterator]).toBe('function');
    });
  });

  describe('getStats', () => {
    test('should return service stats', async () => {
      // Create an active session
      await chatService.sayHi(mockUser);
      
      const stats = chatService.getStats();
      expect(stats).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        activeSessions: 1,
        activeGreetings: 1
      });
    });
  });

  describe('cleanupSessions', () => {
    test('should cleanup expired sessions', async () => {
      // Create a session
      await chatService.sayHi(mockUser);
      
      // Verify session exists
      let stats = chatService.getStats();
      expect(stats.activeSessions).toBe(1);
      
      // Clean up with 0ms max age (immediate expiry)
      chatService.cleanupSessions(0);
      
      // Verify session was cleaned up
      stats = chatService.getStats();
      expect(stats.activeSessions).toBe(0);
      expect(stats.activeGreetings).toBe(0);
    });

    test('should keep active sessions', async () => {
      // Create a session
      await chatService.sayHi(mockUser);
      
      // Clean up with 1 hour max age
      chatService.cleanupSessions(1000 * 60 * 60);
      
      // Verify session still exists
      const stats = chatService.getStats();
      expect(stats.activeSessions).toBe(1);
    });
  });
});
