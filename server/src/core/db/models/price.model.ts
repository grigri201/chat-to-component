import { BaseDB } from '../base';

export interface Price {
    id: number;
    asset_address: string;
    price: string;
    time: string;
}

export class PriceModel extends BaseDB {
    private static instance: PriceModel;

    private constructor() {
        super();
    }

    public static getInstance(): PriceModel {
        if (!PriceModel.instance) {
            PriceModel.instance = new PriceModel();
        }
        return PriceModel.instance;
    }

    async findByAssetAddress(assetAddress: string, count?: number): Promise<Price[]> {
        // Handle edge cases
        if (count === 0) return [];
        if (count && count < 0) count = undefined;

        const query = count
            ? 'SELECT * FROM prices WHERE asset_address = ? ORDER BY time DESC LIMIT ?'
            : 'SELECT * FROM prices WHERE asset_address = ? ORDER BY time DESC';
        const params = count ? [assetAddress, count] : [assetAddress];
        return this.all<Price>(query, params);
    }

    async create(assetAddress: string, price: string, time: string): Promise<Price> {
        const result = await this.run(
            'INSERT INTO prices (asset_address, price, time) VALUES (?, ?, ?)',
            [assetAddress, price, time]
        );
        return {
            id: result.lastID,
            asset_address: assetAddress,
            price: price,
            time: time
        };
    }
}
