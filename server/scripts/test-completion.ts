import { OpenAIService } from '../src/openai.service';

async function main() {
  const service = new OpenAIService();
  
  // Example prompt
  const prompt = process.argv[2] || `
  I have 340$ in my account.
  AAPL market_price is 140.
  MSFT market_price is 180.
  TLSA market_price is 120.
  I want to place a order
  `;
  
  try {
    const { response, sessionId } = await service.completion(prompt);
    
    // Handle streaming response
    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
        process.stdout.write(chunk.choices[0].delta.content);
      }
    }
    console.log('\n\nSession ID:', sessionId);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
