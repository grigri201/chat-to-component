import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { AuthService } from './auth.service';
import * as nacl from 'tweetnacl';

describe('AuthService', () => {
  const validWalletAddress = '5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG';
  const invalidWalletAddress = 'invalid-solana-address';
  let authService: AuthService;

  // 生成一个测试用的密钥对
  const keyPair = nacl.sign.keyPair();
  const mockSignature = Buffer.from(keyPair.secretKey).toString('base64');

  beforeAll(() => {
    authService = AuthService.getInstance();
  });

  describe('validateAddress', () => {
    test('should validate correct ethereum address format', () => {
      expect(authService.validateAddress(validWalletAddress)).toBe(true);
    });

    test('should reject invalid address format', () => {
      expect(authService.validateAddress(invalidWalletAddress)).toBe(false);
    });
  });

  describe('generateNonce', () => {
    test('should generate a nonce with expiry for valid wallet address', async () => {
      const result = await authService.generateNonce(validWalletAddress);
      
      expect(result.nonce).toBeDefined();
      expect(typeof result.nonce).toBe('string');
      expect(result.expiresIn).toBe(30000); // 30 seconds
    });

    test('should throw error for invalid wallet address', async () => {
      try {
        await authService.generateNonce(invalidWalletAddress);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid wallet address format');
      }
    });

    test('should generate different nonces for the same wallet address', async () => {
      const result1 = await authService.generateNonce(validWalletAddress);
      const result2 = await authService.generateNonce(validWalletAddress);
      
      expect(result1.nonce).not.toBe(result2.nonce);
    });
  });

  describe('verifySignature', () => {
    test('should throw error if no nonce exists for wallet', async () => {
      // Clear any existing nonces
      authService['nonceStore'].clear();
      
      try {
        await authService.verifySignature(validWalletAddress, mockSignature);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('No nonce found for this wallet address');
      }
    });

    test('should remove nonce after failed verification', async () => {
      // Generate a new nonce
      await authService.generateNonce(validWalletAddress);
      
      // Try to verify with invalid signature
      try {
        await authService.verifySignature(validWalletAddress, mockSignature);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid signature');
      }

      // Try again - should fail because nonce was removed
      try {
        await authService.verifySignature(validWalletAddress, mockSignature);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('No nonce found for this wallet address');
      }
    });
  });

  describe('validateSession', () => {
    test('should throw error for invalid session token', async () => {
      try {
        await authService.validateSession('invalidToken');
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid session');
      }
    });
  });

  describe('cleanupExpiredNonces', () => {
    test('should keep valid nonces', async () => {
      // Generate a nonce
      const nonce = await authService.generateNonce(validWalletAddress);
      
      // Wait a short time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to verify with the mock signature
      try {
        await authService.verifySignature(validWalletAddress, mockSignature);
      } catch (error: any) {
        // Expected error: Invalid signature
        expect(error.message).toBe('Invalid signature');
      }
    });
  });
});