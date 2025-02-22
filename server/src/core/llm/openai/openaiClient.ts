import OpenAI from 'openai';
import type { Stream } from 'openai/streaming.mjs';
import { placeOrderTool } from '~/tools/code/placeOrder.tool';

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string = process.env.OPENAI_API_KEY!) {
    this.client = new OpenAI({ apiKey });
  }

  async createChatCompletion(messages: OpenAI.Chat.ChatCompletionMessageParam[]):Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
}> {
    return this.client.chat.completions.create({
      messages,
      model: 'gpt-4',
      stream: true,
      temperature: 0.2,
      presence_penalty: 0.6,
      tools: [placeOrderTool],
      tool_choice: 'auto'
    });
  }
}
