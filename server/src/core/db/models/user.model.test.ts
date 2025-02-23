import { expect, test, describe, beforeAll, afterEach, afterAll } from "bun:test";
import { UserModel } from "./user.model";
import { TestDB } from "../test/testDb";

describe("UserModel", () => {
    const testDb = TestDB.getInstance();
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

    test("should create a new user", async () => {
        const walletAddress = "0x123";
        const user = await userModel.create(walletAddress);
        
        expect(user).toEqual({
            id: expect.any(Number),
            wallet_address: walletAddress
        });
    });

    test("should find user by wallet address", async () => {
        const walletAddress = "0x123";
        const createdUser = await userModel.create(walletAddress);
        const foundUser = await userModel.findByWalletAddress(walletAddress);
        
        expect(foundUser).toEqual(createdUser);
    });

    test("should return undefined for non-existent wallet address", async () => {
        const foundUser = await userModel.findByWalletAddress("0xnonexistent");
        expect(foundUser).toBeUndefined();
    });

    test("should not allow duplicate wallet addresses", async () => {
        const walletAddress = "0x123";
        await userModel.create(walletAddress);
        
        try {
            await userModel.create(walletAddress);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});
