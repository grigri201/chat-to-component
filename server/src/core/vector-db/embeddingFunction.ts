import OpenAI from 'openai';

export interface IEmbeddingFunction {
  generate(texts: string[]): Promise<number[][]>;
}

export class DefaultEmbeddingFunction implements IEmbeddingFunction {
  // Default dimension for OpenAI embeddings
  private readonly dimension: number = 1536;

  async generate(texts: string[]): Promise<number[][]> {
    // Temporary implementation that returns zero vectors
    // This should be replaced with actual embedding generation logic
    return texts.map(() => new Array(this.dimension).fill(0));
  }
}

export class OpenAIEmbeddingFunction implements IEmbeddingFunction {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'text-embedding-ada-002') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }
}
