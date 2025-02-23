import { expect, test, describe, beforeAll, afterEach, afterAll } from "bun:test";
import { BalanceModel } from "./balance.model";
import { UserModel } from "./user.model";
import { TestDB } from "../test/testDb";

describe("BalanceModel", () => {
    const testDb = TestDB.getInstance();
    const balanceModel = BalanceModel.getInstance();
    const userModel = UserModel.getInstance();

    beforeAll(async () => {
        try {
            await testDb.setupTestTables();
        } catch (err) {
            console.error('Failed to setup test tables:', err);
            throw err;
        }
    });

    afterEach(async () => {
        try {
            await testDb.clearTables();
        } catch (err) {
            console.error('Failed to clear tables:', err);
            throw err;
        }
    });

    afterAll(async () => {
        try {
            await testDb.dropTables();
        } catch (err) {
            console.error('Failed to drop tables:', err);
            throw err;
        }
    });

    const createTestUser = async () => {
        const walletAddress = "0x123";
        await userModel.create(walletAddress);
        return walletAddress;
    };

    test("should create and update balance", async () => {
        const walletAddress = await createTestUser();
        const assetAddress = "0xasset";
        
        await balanceModel.updateBalance(walletAddress, assetAddress, 100.0);
        const balance = await balanceModel.findByWalletAndAsset(walletAddress, assetAddress);
        
        expect(balance).toEqual({
            id: expect.any(Number),
            wallet_address: walletAddress,
            asset_address: assetAddress,
            quantity: 100.0
        });
    });

    test("should update existing balance", async () => {
        const walletAddress = await createTestUser();
        const assetAddress = "0xasset";
        
        await balanceModel.updateBalance(walletAddress, assetAddress, 100.0);
        await balanceModel.updateBalance(walletAddress, assetAddress, 150.0);
        
        const balance = await balanceModel.findByWalletAndAsset(walletAddress, assetAddress);
        expect(balance?.quantity).toBe(150.0);
    });

    test("should get all balances for wallet", async () => {
        const walletAddress = await createTestUser();
        
        await balanceModel.updateBalance(walletAddress, "0xasset1", 100.0);
        await balanceModel.updateBalance(walletAddress, "0xasset2", 200.0);
        
        const balances = await balanceModel.getAllBalances(walletAddress);
        expect(balances).toHaveLength(2);
        expect(balances).toEqual([
            {
                id: expect.any(Number),
                wallet_address: walletAddress,
                asset_address: "0xasset1",
                quantity: 100.0
            },
            {
                id: expect.any(Number),
                wallet_address: walletAddress,
                asset_address: "0xasset2",
                quantity: 200.0
            }
        ]);
    });

    test("should return undefined for non-existent balance", async () => {
        const walletAddress = await createTestUser();
        const balance = await balanceModel.findByWalletAndAsset(walletAddress, "0xnonexistent");
        expect(balance).toBeUndefined();
    });

    test("should not create balance for non-existent wallet", async () => {
        try {
            await balanceModel.updateBalance("0xnonexistent", "0xasset", 100.0);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test("should enforce unique wallet and asset combination", async () => {
        const walletAddress = await createTestUser();
        const assetAddress = "0xasset";
        
        await balanceModel.updateBalance(walletAddress, assetAddress, 100.0);
        
        // Second update should work (update existing balance)
        await balanceModel.updateBalance(walletAddress, assetAddress, 200.0);
        
        const balance = await balanceModel.findByWalletAndAsset(walletAddress, assetAddress);
        expect(balance?.quantity).toBe(200.0);
    });
});
