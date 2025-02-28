import { BaseDB } from '../base';

export interface Balance {
    id: number;
    wallet_address: string;
    asset_address: string;
    quantity: number;
    created_at: string;
}

export class BalanceModel extends BaseDB {
    private static instance: BalanceModel;

    private constructor() {
        super();
    }

    public static getInstance(): BalanceModel {
        if (!BalanceModel.instance) {
            BalanceModel.instance = new BalanceModel();
        }
        return BalanceModel.instance;
    }

    async findByWalletAndAsset(walletAddress: string, assetAddress: string): Promise<Balance | undefined> {
        return this.get<Balance>(
            'SELECT * FROM balances WHERE wallet_address = ? AND asset_address = ?',
            [walletAddress, assetAddress]
        );
    }

    async updateBalance(walletAddress: string, assetAddress: string, quantity: number): Promise<void> {
        const balance = await this.findByWalletAndAsset(walletAddress, assetAddress);
        
        if (balance) {
            await this.run(
                'UPDATE balances SET quantity = ? WHERE wallet_address = ? AND asset_address = ?',
                [quantity, walletAddress, assetAddress]
            );
        } else {
            await this.run(
                'INSERT INTO balances (wallet_address, asset_address, quantity, created_at) VALUES (?, ?, ?, datetime("now"))',
                [walletAddress, assetAddress, quantity]
            );
        }
    }

    async getAllBalances(walletAddress: string, startDate?: Date, endDate?: Date): Promise<Balance[]> {
        let query = 'SELECT * FROM balances WHERE wallet_address = ?';
        const params: (string | Date)[] = [walletAddress];

        if (startDate || endDate) {
            if (startDate) {
                query += ' AND created_at >= datetime(?)';
                params.push(startDate);
            }
            if (endDate) {
                query += ' AND created_at <= datetime(?)';
                params.push(endDate);
            }
        }

        query += ' ORDER BY created_at DESC';
        return this.all<Balance>(query, params);
    }
}
