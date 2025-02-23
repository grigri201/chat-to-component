import { BaseDB } from '../base';

export interface User {
    id: number;
    wallet_address: string;
}

export class UserModel extends BaseDB {
    private static instance: UserModel;

    private constructor() {
        super();
    }

    public static getInstance(): UserModel {
        if (!UserModel.instance) {
            UserModel.instance = new UserModel();
        }
        return UserModel.instance;
    }

    async findByWalletAddress(walletAddress: string): Promise<User | undefined> {
        return this.get<User>('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    }

    async create(walletAddress: string): Promise<User> {
        const result = await this.run(
            'INSERT INTO users (wallet_address) VALUES (?)',
            [walletAddress]
        );
        return {
            id: result.lastID,
            wallet_address: walletAddress
        };
    }
}
