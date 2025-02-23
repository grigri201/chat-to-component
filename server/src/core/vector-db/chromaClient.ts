import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction, type IEmbeddingFunction } from './embeddingFunction';

export interface ChromaConfig {
  host?: string;
  port?: number;
  maxRetries?: number;
  retryDelay?: number;
  embeddingFunction?: IEmbeddingFunction;
}

export class ChromaManager {
  private client: ChromaClient;
  private config: ChromaConfig;
  private embeddingFunction: IEmbeddingFunction;
  private static instance: ChromaManager;

  private constructor(config: ChromaConfig = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 8000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };
    this.embeddingFunction = config.embeddingFunction || new DefaultEmbeddingFunction();
    this.client = new ChromaClient({
      path: `http://${this.config.host}:${this.config.port}`,
    });
  }

  public static getInstance(config?: ChromaConfig): ChromaManager {
    if (!ChromaManager.instance) {
      ChromaManager.instance = new ChromaManager(config);
    }
    return ChromaManager.instance;
  }

  public async initialize(): Promise<void> {
    let retries = 0;
    while (retries < this.config.maxRetries!) {
      try {
        await this.client.heartbeat();
        console.log('Successfully connected to ChromaDB');
        return;
      } catch (error) {
        retries++;
        if (retries === this.config.maxRetries) {
          throw new Error(`Failed to connect to ChromaDB after ${retries} attempts: ${error}`);
        }
        console.warn(`Connection attempt ${retries} failed, retrying in ${this.config.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }
  }

  public getClient(): ChromaClient {
    return this.client;
  }

  public async createCollection(name: string, metadata?: Record<string, any>) {
    try {
      const collection = await this.client.createCollection({
        name,
        metadata,
        embeddingFunction: this.embeddingFunction
      });
      return collection;
    } catch (error) {
      throw new Error(`Failed to create collection ${name}: ${error}`);
    }
  }

  public async getCollection(name: string) {
    try {
      const collection = await this.client.getCollection({
        name,
        embeddingFunction: this.embeddingFunction
      });
      return collection;
    } catch (error) {
      throw new Error(`Failed to get collection ${name}: ${error}`);
    }
  }
}
