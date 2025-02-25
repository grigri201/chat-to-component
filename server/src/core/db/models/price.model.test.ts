import { expect, test, describe, beforeAll, afterEach, afterAll } from "bun:test";
import { PriceModel } from "./price.model";
import { TestDB } from "../test/testDb";

describe("PriceModel", () => {
    const testDb = TestDB.getInstance();
    const priceModel = PriceModel.getInstance();

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

    test("should create a new price record", async () => {
        const assetAddress = "0x123";
        const price = "1000.50";
        const time = "2025-02-25 10:16";

        const priceRecord = await priceModel.create(assetAddress, price, time);
        
        expect(priceRecord).toEqual({
            id: expect.any(Number),
            asset_address: assetAddress,
            price: price,
            time: time
        });
    });

    test("should find all prices by asset address when count is not provided", async () => {
        const assetAddress = "0x123";
        const price1 = "1000.50";
        const time1 = "2025-02-25 10:16";
        const price2 = "1001.50";
        const time2 = "2025-02-25 10:17";
        const price3 = "1002.50";
        const time3 = "2025-02-25 10:18";

        await priceModel.create(assetAddress, price1, time1);
        await priceModel.create(assetAddress, price2, time2);
        await priceModel.create(assetAddress, price3, time3);
        
        const allPrices = await priceModel.findByAssetAddress(assetAddress);
        
        expect(allPrices).toHaveLength(3);
        expect(allPrices[0]).toEqual(expect.objectContaining({
            price: price3,
            time: time3
        }));
        expect(allPrices[2]).toEqual(expect.objectContaining({
            price: price1,
            time: time1
        }));
    });

    test("should limit the number of returned prices when count is provided", async () => {
        const assetAddress = "0x123";
        const prices = [
            { price: "1000.50", time: "2025-02-25 10:16" },
            { price: "1001.50", time: "2025-02-25 10:17" },
            { price: "1002.50", time: "2025-02-25 10:18" },
            { price: "1003.50", time: "2025-02-25 10:19" },
            { price: "1004.50", time: "2025-02-25 10:20" }
        ];

        // Create test data
        for (const data of prices) {
            await priceModel.create(assetAddress, data.price, data.time);
        }

        // Test with different count values
        const testCases = [
            { count: 1, expectedLength: 1 },
            { count: 3, expectedLength: 3 },
            { count: 5, expectedLength: 5 },
            { count: 10, expectedLength: 5 } // Should return all available prices when count > available
        ];

        for (const { count, expectedLength } of testCases) {
            const limitedPrices = await priceModel.findByAssetAddress(assetAddress, count);
            expect(limitedPrices).toHaveLength(expectedLength);

            // Verify order (most recent first)
            for (let i = 0; i < limitedPrices.length; i++) {
                expect(limitedPrices[i]).toEqual(expect.objectContaining({
                    price: prices[prices.length - 1 - i].price,
                    time: prices[prices.length - 1 - i].time
                }));
            }
        }
    });

    test("should handle edge cases for count parameter", async () => {
        const assetAddress = "0x123";
        await priceModel.create(assetAddress, "1000.50", "2025-02-25 10:16");

        // Test with count = 0
        const emptyResult = await priceModel.findByAssetAddress(assetAddress, 0);
        expect(emptyResult).toHaveLength(0);

        // Test with negative count (should return all prices)
        const negativeCount = await priceModel.findByAssetAddress(assetAddress, -1);
        expect(negativeCount).toHaveLength(1);

        // Test with non-existent asset address
        const nonExistentAsset = await priceModel.findByAssetAddress("0xnonexistent", 5);
        expect(nonExistentAsset).toHaveLength(0);
    });
});
