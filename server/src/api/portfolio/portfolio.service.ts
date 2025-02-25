import { OrderModel, type Order } from '~/core/db/models/order.model';
import logger from '~/utils/logger';

export class PortfolioService {
    private static instance: PortfolioService;
    private orderModel: OrderModel;

    private constructor() {
        this.orderModel = OrderModel.getInstance();
    }

    public static getInstance(): PortfolioService {
        if (!PortfolioService.instance) {
            PortfolioService.instance = new PortfolioService();
        }
        return PortfolioService.instance;
    }

    async getOpenOrders(walletAddress: string, orderType: string): Promise<Order[]> {
        try {
            const orders = await this.orderModel.getOpenOrdersByType(walletAddress, orderType);
            return orders;
        } catch (error) {
            logger.error('Error getting open orders:', error);
            throw error;
        }
    }
}
