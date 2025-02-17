import { isValidJson, safeJsonParse } from "./json-helper";

// Message types
export type MessageType = 'session' | 'react' | 'error' | 'completion';

interface BaseMessage {
  type: MessageType;
}

export interface SessionMessage extends BaseMessage {
  type: 'session';
  sessionId: string;
}

export interface ReactMessage extends BaseMessage {
  type: 'react';
  code: string;
}

export interface CompletionMessage extends BaseMessage {
  type: 'completion';
  text: string;
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  text: string;
}

export type Message = SessionMessage | ReactMessage | CompletionMessage | ErrorMessage;

/**
 * Handles different types of messages received from the server
 */
export class ChunkFormatter {
  private buffer: string = '';
  private isBuffering: boolean = false;

  /**
   * Handle incoming message chunk
   */
  handleChunk(chunk: string): Message[] {
    const startMarker = '[[[';
    const endMarker = ']]]';
    const messages: Message[] = [];

    // If we're not buffering, check for completion message before any markers
    if (!this.isBuffering) {
      const startIndex = chunk.indexOf(startMarker);
      if (startIndex > 0) {
        const completionText = chunk.substring(0, startIndex).trim();
        if (completionText) {
          messages.push({
            type: 'completion',
            text: completionText
          });
        }
        // Remove the processed completion part from the chunk
        chunk = chunk.substring(startIndex);
      } else if (startIndex === -1) {
        // No marker found, treat as completion message
        return [{
          type: 'completion',
          text: chunk
        }];
      }
    }

    // Start buffering if we find the start marker
    if (chunk.includes(startMarker) && !this.isBuffering) {
      this.isBuffering = true;
      this.buffer = chunk.substring(chunk.indexOf(startMarker) + startMarker.length);
      return messages;
    }

    // If we're buffering, append the chunk
    if (this.isBuffering) {
      this.buffer += chunk;
      
      // Check if we have the end marker
      const endIndex = this.buffer.indexOf(endMarker);
      if (endIndex !== -1) {
        const content = this.buffer.substring(0, endIndex);
        this.buffer = '';
        this.isBuffering = false;

        // Process the buffered content
        if (isValidJson(content)) {
          const message = safeJsonParse<Message>(content);
          if (message) {
            messages.push(message);
          }
        } else {
          messages.push({
            type: 'react',
            code: this.standardizedReactStrings(content)
          });
        }

        // Process any remaining content after the end marker
        const remainingContent = this.buffer.substring(endIndex + endMarker.length);
        if (remainingContent.trim()) {
          messages.push({
            type: 'completion',
            text: remainingContent.trim()
          });
        }
      }
    }

    return messages;
  }

  private standardizedReactStrings(message: string): string {
    return message
      .replace(/\[\[\[|\]\]\]/g, '') // Remove [[[ and ]]] markers
      .replace(/```jsx\s+|```/g, ''); // Remove ```jsx and ``` markers
  }
}

// Export a singleton instance
export const chunkFormatter = new ChunkFormatter();
