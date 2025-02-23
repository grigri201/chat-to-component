import { expect, test, describe, beforeAll, afterEach, afterAll } from "bun:test";
import { OrderModel } from "./order.model";
import { UserModel } from "./user.model";
import { TestDB } from "../test/testDb";
import type { Order } from "./order.model";

describe("OrderModel", () => {
    const testDb = TestDB.getInstance();
    const orderModel = OrderModel.getInstance();
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

    const createTestOrder = async (walletAddress: string): Promise<Order | undefined> => {
        return await orderModel.create({
            wallet_address: walletAddress,
            asset_address: "0xasset",
            direction: "buy",
            order_type: "limit",
            quantity: 1.0,
            limit_price: 100.0,
            status: "open"
        });
    };

    test("should create a new order", async () => {
        const walletAddress = await createTestUser();
        const order = await createTestOrder(walletAddress);
        
        expect(order).toBeDefined();
        expect(order).toEqual({
            id: expect.any(Number),
            wallet_address: walletAddress,
            asset_address: "0xasset",
            direction: "buy",
            order_type: "limit",
            quantity: 1.0,
            limit_price: 100.0,
            status: "open",
            created_at: expect.any(String),
            updated_at: expect.any(String)
        });
    });

    test("should find order by id", async () => {
        const walletAddress = await createTestUser();
        const createdOrder = await createTestOrder(walletAddress);
        expect(createdOrder).toBeDefined();
        if (!createdOrder) return;

        const foundOrder = await orderModel.findById(createdOrder.id);
        expect(foundOrder).toBeDefined();
        expect(foundOrder).toEqual(createdOrder);
    });

    test("should find orders by wallet address", async () => {
        const walletAddress = await createTestUser();
        const order1 = await createTestOrder(walletAddress);
        const order2 = await createTestOrder(walletAddress);
        expect(order1).toBeDefined();
        expect(order2).toBeDefined();
        if (!order1 || !order2) return;
        
        const orders = await orderModel.findByWalletAddress(walletAddress);
        expect(orders).toHaveLength(2);
        expect(orders).toEqual(expect.arrayContaining([order1, order2]));
    });

    test("should update order status", async () => {
        const walletAddress = await createTestUser();
        const order = await createTestOrder(walletAddress);
        expect(order).toBeDefined();
        if (!order) return;
        
        // Wait a bit to ensure timestamp changes
        await new Promise(resolve => setTimeout(resolve, 1000));
        await orderModel.updateStatus(order.id, "filled");
        const updatedOrder = await orderModel.findById(order.id);
        expect(updatedOrder).toBeDefined();
        
        expect(updatedOrder?.status).toBe("filled");
        expect(updatedOrder?.updated_at).not.toEqual(order.updated_at);
    });

    test("should not create order for non-existent wallet", async () => {
        await expect(createTestOrder("0xnonexistent")).rejects.toThrow(/FOREIGN KEY constraint failed/);
    });
});
