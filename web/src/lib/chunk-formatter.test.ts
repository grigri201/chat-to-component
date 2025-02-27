import { test, expect } from 'bun:test';
import { ChunkFormatter, Message } from './chunk-formatter';

const sampleText = `Hello! Welcome back. It's great to see you again. I see that you have some orders already placed. Let me provide you with the asset information related to your orders in a structured format.

Here is the asset information related to your orders:

\`\`\`json
{
  "type": "assets",
  "data": [
    {
      "address": "AAPLLLLLL1",
      "symbol": "AAPL",
      "prices": ["1429.36", "1225.94"],
      "change": "-14.23%"
    },
    {
      "address": "MSFTTTTTT2",
      "symbol": "MSFT",
      "prices": ["1467.69", "1169.22"],
      "change": "-20.33%"
    },
    {
      "address": "TLSAAAAAA3",
      "symbol": "TLSA",
      "prices": ["1290.44", "1154.76"],
      "change": "-10.52%"
    }
  ]
}
\`\`\`

The \`change\` is calculated as the percentage difference between the two prices provided. 

If you have any questions or need further assistance, feel free to ask! Remember, it's always wise to invest conservatively and consider all factors before making financial decisions.`;

test('should handle complete message with JSON block', () => {
    const formatter = new ChunkFormatter();
    let messages: Message[] = [];
    
    // Split the text into smaller chunks to simulate streaming
    const chunkSize = 50;
    for (let i = 0; i < sampleText.length; i += chunkSize) {
      const chunk = sampleText.slice(i, i + chunkSize);
      const result = formatter.handleChunk(chunk);
      messages = result
    }

    // Process any remaining buffer
    const finalResult = formatter.handleChunk('');
    messages = finalResult

    // Verify the messages
    expect(messages).toHaveLength(3);
    
    // First message should be completion type with initial text
    expect(messages[0]).toEqual({
      type: 'completion',
      text: expect.stringContaining('Hello! Welcome back')
    });

    // Second message should be assets type with JSON data
    expect(messages[1]).toEqual({
      type: 'assets',
      data: expect.arrayContaining([
        expect.objectContaining({
          symbol: 'AAPL',
          change: '-14.23%'
        }),
        expect.objectContaining({
          symbol: 'MSFT',
          change: '-20.33%'
        }),
        expect.objectContaining({
          symbol: 'TLSA',
          change: '-10.52%'
        })
      ])
    });

    // Third message should be completion type with final text
    expect(messages[2]).toEqual({
      type: 'completion',
      text: expect.stringContaining('The `change` is calculated')
    });
  });

test('should handle backtick split across chunks', () => {
    const formatter = new ChunkFormatter();
    let messages: Message[] = [];
    
    // First chunk ends with a backtick
    let chunk1 = 'Hello `';
    let result = formatter.handleChunk(chunk1);
    messages = result;
    expect(messages).toHaveLength(0); // Should wait for next chunk
    
    // Second chunk completes the code block marker
    let chunk2 = '``json\n{"type": "assets", "data": []}\n```\n';
    result = formatter.handleChunk(chunk2);
    messages = result;

    // Process any remaining buffer
    const finalResult = formatter.handleChunk('');
    messages = finalResult;

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      type: 'completion',
      text: 'Hello '
    });
});

test('should handle incomplete JSON with type and empty data array', () => {
    const formatter = new ChunkFormatter();
    const messages: Message[] = [];
    
    // Send incomplete JSON with type and empty data array
    const chunk1 = '```json\n{\n  "type": "assets",\n  "data": [';
    let result = formatter.handleChunk(chunk1);
    messages.push(...result);

    // Process any remaining buffer
    const finalResult = formatter.handleChunk('');
    messages.push(...finalResult);

    expect(messages).toHaveLength(0);
});

test('should handle incomplete JSON with partial data', () => {
    const formatter = new ChunkFormatter();
    const messages: Message[] = [];
    
    // First chunk with opening and partial data
    const chunk1 = '```json\n{\n  "type": "assets",\n  "data": [\n    {\n      "symbol": "AAPL",';
    let result = formatter.handleChunk(chunk1);
    messages.push(...result);

    // Process any remaining buffer
    const finalResult = formatter.handleChunk('');
    messages.push(...finalResult);

    expect(messages).toHaveLength(0);
});

test('should handle malformed JSON', () => {
    const formatter = new ChunkFormatter();
    const messages: Message[] = [];
    
    // Send malformed JSON
    const chunk = '```json\n{\n  "type": "assets",\n  "data": [\n    {\n      "symbol": "AAPL",\n      "price": }\n  ]\n}\n```';
    let result = formatter.handleChunk(chunk);
    messages.push(...result);

    // Process any remaining buffer
    const finalResult = formatter.handleChunk('');
    messages.push(...finalResult);

    console.log(messages);

    expect(messages).toHaveLength(0);
});
