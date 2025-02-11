import { readFileSync } from 'fs';
import { join } from 'path';

export function loadPrompt(name: string): string {
  const promptPath = join(__dirname, `${name}.prompt.md`);
  return readFileSync(promptPath, 'utf-8');
}
