/**
 * Checks if a string is valid JSON
 * @param str - The string to validate
 * @returns boolean indicating if the string is valid JSON
 */
export function isValidJson(str: string): boolean {
  if (typeof str !== 'string') return false;
  
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely parses JSON with type checking
 * @param str - The string to parse
 * @returns The parsed JSON object or null if invalid
 */
export function safeJsonParse<T>(str: string): T | undefined {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return undefined;
  }
}

/**
 * Attempts to parse a potentially incomplete JSON string into a valid JSON object.
 * This utility handles cases where the JSON string might be truncated or malformed.
 * 
 * @param input - The potentially incomplete JSON string to parse
 * @returns The parsed JSON object if successful, null otherwise
 */
export function parsePartialJson<T>(input: string): T | null {
  // First attempt: try parsing the string as-is
  try {
    const result = JSON.parse(input) as T;
    return result;
  } catch (e) {
    // Continue with partial parsing if direct parsing fails
  }

  // Initialize parsing state
  let newString = "";
  const stack: string[] = [];
  let isInsideString = false;
  let escaped = false;

  // Process each character in the string
  for (const char of input) {
    if (isInsideString) {
      if (char === '"' && !escaped) {
        isInsideString = false;
      } else if (char === '\n' && !escaped) {
        // Replace newline with escape sequence
        newString += '\\n';
        continue;
      } else if (char === '\\') {
        escaped = !escaped;
      } else {
        escaped = false;
      }
    } else {
      if (char === '"') {
        isInsideString = true;
        escaped = false;
      } else if (char === '{') {
        stack.push('}');
      } else if (char === '[') {
        stack.push(']');
      } else if (char === '}' || char === ']') {
        if (stack.length && stack[stack.length - 1] === char) {
          stack.pop();
        } else {
          // Mismatched closing character
          return null;
        }
      }
    }

    newString += char;
  }

  // Close any unclosed string
  if (isInsideString) {
    newString += '"';
  }

  // Close any remaining open structures in reverse order
  for (let i = stack.length - 1; i >= 0; i--) {
    newString += stack[i];
  }

  // Final attempt to parse the modified string
  try {
    return JSON.parse(newString) as T;
  } catch {
    return null;
  }
}

/**
 * Extracts and parses the first JSON block from markdown-style text
 * @param text - The text containing markdown-style JSON blocks
 * @returns Parsed JSON object or null if no valid JSON block found
 */
export function parseJsonBlocks<T>(text: string): T | null {
  try {
    // First try to match a complete JSON block
    const completeBlockRegex = /```json\n([\s\S]*?)```/;
    const completeMatch = text.match(completeBlockRegex);

    if (completeMatch) {
      const jsonContent = completeMatch[1].trim();
      try {
        const parsed = JSON.parse(jsonContent);
        return parsed;
      } catch (e) {
        // If direct parsing fails, try partial parsing
        return parsePartialJson<T>(jsonContent);
      }
    }

    // If no complete block found, try to match an incomplete block
    const incompleteBlockRegex = /```json\n([\s\S]*$)/;
    const incompleteMatch = text.match(incompleteBlockRegex);

    if (incompleteMatch) {
      const jsonContent = incompleteMatch[1].trim();
      return parsePartialJson<T>(jsonContent);
    }

    return null;
  } catch (e) {
    return null;
  }
}
