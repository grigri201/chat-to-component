export class Storage {
  private sessionId: string | null = null;

  /**
   * Get the current session ID
   */
  getSessionId(): string | undefined {
    return this.sessionId ? this.sessionId : undefined;
  }

  /**
   * Set the session ID in localStorage
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    localStorage.setItem("sessionId", sessionId);
  }

  /**
   * Load session ID from localStorage
   */
  loadStoredSession(): void {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      this.sessionId = storedSessionId;
    }
  }
}

export const storage = new Storage();
