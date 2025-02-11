import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import {  generateCode } from './systemPrompts';
import { placeOrderTool } from './tools/placeOrder.tool';

type Message = OpenAI.Chat.ChatCompletionMessageParam;

interface Session {
  messages: Message[];
  lastActivity: Date;
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  private sessions: Map<string, Session>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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
      ],
      lastActivity: new Date(),
    });
    return { sessionId: newSessionId, isNew: true };
  }

  async completion(prompt: string, sessionId?: string) {
    const { sessionId: activeSessionId, isNew } = this.getSession(sessionId);
    const session = this.sessions.get(activeSessionId)!;
    
    session.messages.push({ role: 'user', content: prompt });
    session.lastActivity = new Date();

    const response = await this.openai.chat.completions.create({
      messages: session.messages,
      model: 'gpt-4',
      stream: true,
      temperature: 0.7,
      presence_penalty: 0.6,
      tools: [placeOrderTool],
      tool_choice: 'auto'
    });

    return { response, sessionId: activeSessionId, isNew };
  }

  getStats() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
