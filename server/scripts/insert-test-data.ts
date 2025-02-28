import { PriceModel } from '../src/core/db/models/price.model';
import { OrderModel, type OrderDirection, type OrderType, type OrderStatus } from '../src/core/db/models/order.model';
import { BalanceModel } from '../src/core/db/models/balance.model';

async function insertTestData() {
    const priceModel = PriceModel.getInstance();
    const orderModel = OrderModel.getInstance();
    const balanceModel = BalanceModel.getInstance();

    // Test data for prices
    const testAssets = [
        'AAPLLLLLL1', // AAPL
        'MSFTTTTTT2', // MSFT
        'TLSAAAAAA3', // TLSA
    ];

    // Insert price data for the last 7 days
    for (const assetAddress of testAssets) {
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const price = (1000 + Math.random() * 500).toFixed(2);
            await priceModel.create(
                assetAddress,
                price,
                date.toISOString()
            );
        }
    }

    // Test data for orders
    const testWallets = [
        '4R8HehpFNXQqds4doZGGNAPfpo4AcHZfu4wbtMSsb7iY'
    ];

    const orderTypes: OrderType[] = ['market', 'limit'];
    const directions: OrderDirection[] = ['buy', 'sell'];
    const statuses: OrderStatus[] = ['open', 'filled', 'canceled'];

    // Create various orders with different combinations
    for (const wallet of testWallets) {
        for (const asset of testAssets) {
            for (const type of orderTypes) {
                for (const direction of directions) {
                    await orderModel.create({
                        wallet_address: wallet,
                        asset_address: asset,
                        direction: direction,
                        order_type: type,
                        quantity: Math.floor(Math.random() * 10) + 1,
                        limit_price: type === 'limit' ? Math.floor(Math.random() * 1000) + 500 : 0,
                        status: statuses[Math.floor(Math.random() * statuses.length)]
                    });
                }
            }
        }
    }

    // Test data for balances
    // Each wallet will have balance history for the past 7 days for each asset
    for (const wallet of testWallets) {
        for (const asset of testAssets) {
            // Insert balance data for each day in the past 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const quantity = (Math.random() * 1000).toFixed(2);
                
                // Use direct SQL insertion to set specific dates
                await balanceModel.run(
                    'INSERT INTO balances (wallet_address, asset_address, quantity, created_at) VALUES (?, ?, ?, datetime(?))',
                    [wallet, asset, parseFloat(quantity), date.toISOString()]
                );
            }
        }
    }

    console.log('Test data inserted successfully!');
}

// Run the script
insertTestData().catch(console.error);
