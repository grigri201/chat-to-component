import { parseJsonBlocks } from "./json-helper";

export interface Message {
  type: string;
  text?: string;
  sessionId?: string;
  data?: any;
}
/**
 * Handles different types of messages received from the server
 */
export class ChunkFormatter {
  private buffer: string = "";
  private jsonBuffer: string = "";
  private isJsonMode: boolean = false;
  private messages: Message[] = [];

  /**
   * Handle incoming message chunk
   */
  handleChunk(chunk: string): Message[] {
    // Handle empty chunk case
    if (chunk === "") {
      // Process any remaining JSON buffer
      if (this.isJsonMode && this.jsonBuffer) {
        const jsonContent = parseJsonBlocks<Message>(this.jsonBuffer);
        if (jsonContent !== null) {
          this.messages.push(jsonContent);
        }
        this.isJsonMode = false;
        this.jsonBuffer = "";
        this.buffer = "";
        return this.messages;
      }

      // Only process remaining text buffer if we're not in JSON mode and it doesn't contain JSON markers
      if (
        !this.isJsonMode &&
        this.buffer.length > 0 &&
        !this.buffer.includes("```json")
      ) {
        this.messages.push({
          type: "completion",
          text: this.buffer,
        });
        this.buffer = "";
      }

      return this.messages;
    }
    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage) {
      this.messages.push({
        type: "completion",
        text: chunk,
      });
    }

    // Add chunk to buffer
    this.buffer += chunk;

    // Process non-empty chunk
    if (this.isJsonMode) {
      return this.handleJsonMode();
    } else {
      return this.handleRegularMode();
    }
  }

  private handleJsonMode(): Message[] {
    // Look for the end marker '```' that is not part of '```json'
    const endMatch = this.buffer.match(/```(?!(json|[a-zA-Z]))/);
    const lastMessage = this.messages[this.messages.length - 1];
    if (endMatch?.index !== undefined) {
      // Extract JSON content
      this.jsonBuffer += this.buffer.substring(0, endMatch.index);
      // Always reset state and store remaining text
      this.buffer = this.buffer.substring(endMatch.index + 3);
      const jsonContent = parseJsonBlocks<Message>(this.jsonBuffer);
      this.jsonBuffer = "";
      this.isJsonMode = false;
      if (jsonContent !== null) {
        if (lastMessage.type === "completion") {
          this.messages.push(jsonContent);
        } else {
          this.messages[this.messages.length - 1] = jsonContent;
        }
      }
      return this.messages;
    }
    // Only return valid JSON content, otherwise return empty array
    // Continue buffering JSON content
    this.jsonBuffer += this.buffer;
    this.buffer = "";
    const jsonContent = parseJsonBlocks<Message>(this.jsonBuffer);
    if (jsonContent !== null) {
      if (lastMessage.type === "completion") {
        this.messages.push(jsonContent);
      } else {
        this.messages[this.messages.length - 1] = jsonContent;
      }
    }
    return this.messages;
  }

  private handleRegularMode(): Message[] {
    // Check for partial backtick pattern
    if (this.buffer.endsWith("`")) {
      return this.messages;
    }

    const lastMessage = this.messages[this.messages.length - 1];
    const jsonStart = this.buffer.indexOf("```json");
    if (jsonStart !== -1) {
      // Handle text before JSON block
      if (jsonStart > 0) {
        lastMessage.text = this.buffer.substring(0, jsonStart);
      }

      // Check if we have a complete JSON block
      // const jsonEnd = this.buffer.indexOf('```', jsonStart + 7);
      const endMatch = this.buffer.match(/```(?!(json|[a-zA-Z]))/);
      if (endMatch?.index !== undefined) {
        const jsonContent = parseJsonBlocks<Message>(
          this.buffer.substring(jsonStart, endMatch.index)
        );
        if (jsonContent !== null) {
          this.messages.push(jsonContent);
        }
        // Process remaining text after JSON block
        const remainingText = this.buffer.substring(endMatch.index + 3).trim();
        if (remainingText.length > 0) {
          this.messages.push({
            type: "completion",
            text: remainingText,
          });
        }
        this.buffer = "";
        return this.messages;
      }

      // Switch to JSON mode and skip the ```json marker
      this.buffer = this.buffer.substring(jsonStart); // Skip ```json
      this.jsonBuffer = "";
      this.isJsonMode = true;
      return this.messages;
    } else {
      lastMessage.text = this.buffer;
      // Keep buffering until we find a JSON block or get an empty chunk
      return this.messages;
    }
  }
}

// Export a singleton instance
export const chunkFormatter = new ChunkFormatter();
