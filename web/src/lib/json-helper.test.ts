import { test, expect } from 'bun:test';
import { parseJsonBlocks, parsePartialJson, isValidJson } from './json-helper';

test('parseJsonBlocks with complete JSON block', () => {
  console.log('\n=== Testing complete JSON block ===\n');
  const input = `Some text before
\`\`\`json
{
  "type": "assets",
  "data": [
    {
      "symbol": "AAPL",
      "price": "150.00"
    }
  ]
}
\`\`\`
Some text after`;

  const result = parseJsonBlocks<{ type: string; data: Array<{ symbol: string; price: string }> }>(input);
  expect(result).not.toBeNull();
  expect(result?.type).toBe('assets');
  expect(result?.data[0].symbol).toBe('AAPL');
});

test('parseJsonBlocks with incomplete JSON block', () => {
  console.log('\n=== Testing incomplete JSON block ===\n');
  const input = `\`\`\`json
{
  "type": "assets",
  "data": [
    {
      "symbol": "AAPL",
      "price": "150.00"
    }
`;

  const result = parseJsonBlocks<{ type: string; data: Array<{ symbol: string; price: string }> }>(input);
  expect(result).not.toBeNull();
  expect(result?.type).toBe('assets');
  expect(result?.data[0].symbol).toBe('AAPL');
});

test('parseJsonBlocks with no JSON block', () => {
  console.log('\n=== Testing no JSON block ===\n');
  const input = 'Just some regular text without any JSON blocks';
  const result = parseJsonBlocks(input);
  expect(result).toBeNull();
});

test('parseJsonBlocks with invalid JSON content', () => {
  console.log('\n=== Testing invalid JSON content ===\n');
  const input = `\`\`\`json
  This is not valid JSON
\`\`\``;
  const result = parseJsonBlocks(input);
  expect(result).toBeNull();
});

test('parseJsonBlocks with nested JSON structures', () => {
  console.log('\n=== Testing nested JSON structures ===\n');
  const input = `\`\`\`json
{
  "type": "complex",
  "data": {
    "nested": {
      "array": [1, 2, 3],
      "object": {
        "key": "value"
      }
    }
  }
}
\`\`\``;

  const result = parseJsonBlocks<{
    type: string;
    data: {
      nested: {
        array: number[];
        object: { key: string };
      };
    };
  }>(input);
  
  expect(result).not.toBeNull();
  expect(result?.type).toBe('complex');
  expect(result?.data.nested.array).toEqual([1, 2, 3]);
  expect(result?.data.nested.object.key).toBe('value');
});

test('parsePartialJson with complete JSON', () => {
  console.log('\n=== Testing complete JSON parsing ===\n');
  const input = '{"key": "value"}';
  const result = parsePartialJson<{ key: string }>(input);
  expect(result).not.toBeNull();
  expect(result?.key).toBe('value');
});

test('parsePartialJson with incomplete JSON', () => {
  console.log('\n=== Testing incomplete JSON parsing ===\n');
  const input = '{"key": "value", "array": [1, 2, 3';
  const result = parsePartialJson<{ key: string; array: number[] }>(input);
  expect(result).not.toBeNull();
  expect(result?.key).toBe('value');
  expect(result?.array).toEqual([1, 2, 3]);
});

test('parsePartialJson with unclosed string', () => {
  console.log('\n=== Testing unclosed string ===\n');
  const input = '{"key": "unclosed';
  const result = parsePartialJson<{ key: string }>(input);
  expect(result).not.toBeNull();
  expect(result?.key).toBe('unclosed');
});

test('isValidJson with valid JSON', () => {
  console.log('\n=== Testing valid JSON validation ===\n');
  expect(isValidJson('{"key": "value"}')).toBe(true);
  expect(isValidJson('[1, 2, 3]')).toBe(true);
});

test('isValidJson with invalid JSON', () => {
  console.log('\n=== Testing invalid JSON validation ===\n');
  expect(isValidJson('{"key": value}')).toBe(false);
  expect(isValidJson('not json')).toBe(false);
  expect(isValidJson('')).toBe(false);
});
