import { ChatService } from "~/api/chat/chat.service";

async function main() {
  const service = ChatService.getInstance();
  
  // Example prompt
  const prompt = process.argv[2] || `
  I want to place a order
  `;
  
  try {
    const { response } = await service.completion(prompt, { walletAddress: '0xTestWallet' });
    
    // Handle streaming response
    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
        process.stdout.write(chunk.choices[0].delta.content);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
