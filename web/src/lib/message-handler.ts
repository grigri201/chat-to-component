// Message types
export type MessageType = 'session' | 'error' | 'completion';

interface BaseMessage {
  type: MessageType;
}

interface SessionMessage extends BaseMessage {
  type: 'session';
  sessionId: string;
}

type Message = SessionMessage;

/**
 * Handles different types of messages received from the server
 */
export class MessageHandler {
  private sessionId: string | null = null;

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Set the session ID in localStorage
   */
  private setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    localStorage.setItem('sessionId', sessionId);
  }

  /**
   * Load session ID from localStorage
   */
  loadStoredSession(): void {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      this.sessionId = storedSessionId;
    }
  }

  /**
   * Handle incoming message chunk
   */
  handleMessageChunk(chunk: Message): void {
    try {
      this.handleMessage(chunk);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Handle parsed message object
   */
  private handleMessage(message: Message): void {
    switch (message.type) {
      case 'session':
        this.setSessionId(message.sessionId);
        break;
      default:
        console.warn('Unknown message type received');
    }
  }
}

// Export a singleton instance
export const messageHandler = new MessageHandler();
