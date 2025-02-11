/**
 * API client for interacting with the server endpoints
 */

import { messageHandler } from "./message-handler";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Generic function to handle streaming responses from the server
 */
async function streamResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void
) {
  try {
    const response = await fetch(`${API_BASE_URL}/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
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
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  return streamResponse(prompt, (chunk: string) => {
    console.log({
      chunk
    })
    if (chunk.includes('[[[')) {
      const jsonContent = parseJsonContent(chunk);
      if (jsonContent) {
        messageHandler.handleMessageChunk(jsonContent);
        return;
      }
    }
    onChunk(chunk);
  }, onError);
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