import OpenAI from 'openai';

export type Message = OpenAI.Chat.ChatCompletionMessageParam;

export interface Session {
  messages: Message[];
  lastActivity: Date;
}

export interface ChatResponse {
  response: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;
}
