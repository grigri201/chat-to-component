/**
 * Attempts to parse a potentially incomplete JSON string into a valid JSON object.
 * This utility handles cases where the JSON string might be truncated or malformed.
 * 
 * @param input - The potentially incomplete JSON string to parse
 * @returns The parsed JSON object if successful, null otherwise
 */
export function parsePartialJson(input: string): any {
    // First attempt: try parsing the string as-is
    try {
        return JSON.parse(input);
    } catch {
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
        return JSON.parse(newString);
    } catch {
        return null;
    }
}
