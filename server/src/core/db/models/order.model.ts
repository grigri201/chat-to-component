import { BaseDB } from '../base';

export type OrderDirection = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'open' | 'filled' | 'canceled';

export interface Order {
    id: number;
    wallet_address: string;
    asset_address: string;
    direction: OrderDirection;
    order_type: OrderType;
    quantity: number;
    limit_price: number;
    status: OrderStatus;
    created_at: string;
    updated_at: string;
}

export class OrderModel extends BaseDB {
    private static instance: OrderModel;

    private constructor() {
        super();
    }

    public static getInstance(): OrderModel {
        if (!OrderModel.instance) {
            OrderModel.instance = new OrderModel();
        }
        return OrderModel.instance;
    }

    async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | undefined> {
        const result = await this.run(
            `INSERT INTO orders (
                wallet_address, 
                asset_address, 
                direction, 
                order_type, 
                quantity, 
                limit_price, 
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                order.wallet_address,
                order.asset_address,
                order.direction,
                order.order_type,
                order.quantity,
                order.limit_price,
                order.status
            ]
        );

        return this.findById(result.lastID);
    }

    async findById(id: number): Promise<Order | undefined> {
        return this.get<Order>('SELECT * FROM orders WHERE id = ?', [id]);
    }

    async findByWalletAddress(walletAddress: string): Promise<Order[]> {
        return this.all<Order>('SELECT * FROM orders WHERE wallet_address = ?', [walletAddress]);
    }

    async updateStatus(id: number, status: OrderStatus): Promise<void> {
        await this.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
    }
}
