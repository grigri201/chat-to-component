import { OpenAIService } from '../src/openai.service';

async function main() {
  const service = new OpenAIService();
  
  // Example prompt
  const prompt = process.argv[2] || `
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
