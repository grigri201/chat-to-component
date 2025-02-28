/**
 * API client for interacting with the server endpoints
 */

import { chunkFormatter, Message } from "./chunk-formatter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Generic function to handle streaming responses from the server
 */
async function completionStreaming(
  path: string,
  prompt: string,
  onChunk: (chunk: string) => void,
  onEnd: () => void,
  onError: (error: Error) => void,
  sessionId?: string,
) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test_session_token_for_development`,
      },
      body: JSON.stringify({ prompt, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
    // send empty string to indicate that the stream is complete
    onChunk('');
    onEnd();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}

/**
 * Parse JSON content from a string wrapped in [[[ and ]]]
 */
export function parseJsonContent(content: string): any | null {
  const match = content.match(/\[\[\[(.*?)\]\]\]/s);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.error('Failed to parse JSON content:', e);
    return null;
  }
}

/**
 * Get completion from the AI
 */
export function getCompletion(
  prompt: string,
  onChunk: (messages: Message[]) => void,
  onError: (error: Error) => void,
  sessionId?: string,
): Promise<void> {
  return completionStreaming('/chat/completion',prompt, (chunk: string) => {
    const messages = chunkFormatter.handleChunk(chunk);
    onChunk(messages);
  }, onError, sessionId);
}

/**
 * Get server stats
 */
export async function getStats(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

/**
 * Say hi to the AI
 */
export function sayHi(
  onChunk: (messages: Message[]) => void,
  onEnd: () => void,
  onError: (error: Error) => void,
  sessionId?: string,
): Promise<void> {
  return completionStreaming('/chat/hi', '', (chunk: string) => {
    const messages = chunkFormatter.handleChunk(chunk);
    onChunk(messages);
  },onEnd, onError, sessionId);
}
