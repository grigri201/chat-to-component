import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async completion(prompt: string, systemPrompt?: string) {
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt },
    ];

    return this.openai.chat.completions.create({
      messages,
      model: 'gpt-4',
      stream: true,
      temperature: 0.7,
      presence_penalty: 0.6,
    });
  }

  getStats() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
