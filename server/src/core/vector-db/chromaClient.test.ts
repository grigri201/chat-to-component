import { describe, expect, it, beforeAll } from 'bun:test';
import { ChromaManager } from './chromaClient';

describe('ChromaManager', () => {
  let chromaManager: ChromaManager;

  beforeAll(() => {
    chromaManager = ChromaManager.getInstance({
      host: 'localhost',
      port: 8000,
    });
  });

  it('should successfully initialize connection to ChromaDB', async () => {
    await expect(chromaManager.initialize()).resolves.not.toThrow();
  });

  it('should create and retrieve a collection', async () => {
    const collectionName = 'test_collection';
    const metadata = { description: 'Test collection' };

    // Create collection
    const collection = await chromaManager.createCollection(collectionName, metadata);
    expect(collection).toBeDefined();
    expect(collection.name).toBe(collectionName);

    // Retrieve collection
    const retrievedCollection = await chromaManager.getCollection(collectionName);
    expect(retrievedCollection).toBeDefined();
    expect(retrievedCollection.name).toBe(collectionName);
  });

  it('should maintain singleton instance', () => {
    const instance1 = ChromaManager.getInstance();
    const instance2 = ChromaManager.getInstance();
    expect(instance1).toBe(instance2);
  });
});
