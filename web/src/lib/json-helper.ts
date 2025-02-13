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
