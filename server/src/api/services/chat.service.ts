import { randomUUID } from 'crypto';
import { OpenAIClient } from '~/core/llm/openai/openaiClient';
import { generateCode, knownAssets } from '~/config/prompts';
import type { Session, Message, ChatResponse } from '~/core/llm/openai/types';

export class ChatService {
  private openaiClient: OpenAIClient;
  private sessions: Map<string, Session>;

  constructor() {
    this.openaiClient = new OpenAIClient();
    this.sessions = new Map();
  }

  private getSession(sessionId?: string): { sessionId: string; isNew: boolean } {
    if (sessionId && this.sessions.has(sessionId)) {
      return { sessionId, isNew: false };
    }
    const newSessionId = randomUUID();
    this.sessions.set(newSessionId, {
      messages: [
        { role: 'system', content: generateCode },
        { role: 'system', content: knownAssets },
      ],
      lastActivity: new Date(),
    });
    return { sessionId: newSessionId, isNew: true };
  }

  async completion(prompt: string, sessionId?: string): Promise<ChatResponse> {
    const { sessionId: activeSessionId, isNew } = this.getSession(sessionId);
    const session = this.sessions.get(activeSessionId)!;
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    const response = await this.openaiClient.createChatCompletion(session.messages);

    return { response, sessionId: activeSessionId, isNew };
  }

  getStats() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeSessions: this.sessions.size
    };
  }

  // 清理过期会话
  cleanupSessions(maxAge: number = 1000 * 60 * 60) { // 默认1小时过期
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
