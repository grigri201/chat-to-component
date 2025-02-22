import { db } from '~/core/db';

interface AssetPrice {
  symbol: string;
  price: number;
  timestamp: Date;
}

interface PriceHistory {
  symbol: string;
  prices: {
    price: number;
    timestamp: Date;
  }[];
}

export class AssetService {
  private prices: Map<string, AssetPrice>;
  private updateInterval: NodeJS.Timer;

  constructor() {
    this.prices = new Map();
    this.startPriceUpdates();
  }

  private async startPriceUpdates() {
    // Update prices every minute
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, 60 * 1000);

    // Initial update
    await this.updatePrices();
  }

  private async updatePrices() {
    try {
      // Here you would integrate with your price data provider
      // For now, we'll use dummy data
      const dummyPrices: AssetPrice[] = [
        { symbol: 'BTC', price: 50000, timestamp: new Date() },
        { symbol: 'ETH', price: 3000, timestamp: new Date() },
        // Add more assets as needed
      ];

      for (const price of dummyPrices) {
        this.prices.set(price.symbol, price);
        await this.savePriceToHistory(price);
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  private async savePriceToHistory(price: AssetPrice) {
    // Save price to database
    await db.run(
      'INSERT INTO price_history (symbol, price, timestamp) VALUES (?, ?, ?)',
      [price.symbol, price.price, price.timestamp]
    );
  }

  async getLatestPrices(): Promise<AssetPrice[]> {
    return Array.from(this.prices.values());
  }

  async getPriceHistory(symbol: string): Promise<PriceHistory> {
    const prices = await db.all(
      'SELECT price, timestamp FROM price_history WHERE symbol = ? ORDER BY timestamp DESC LIMIT 100',
      [symbol]
    );

    return {
      symbol,
      prices: prices.map(p => ({
        price: p.price,
        timestamp: new Date(p.timestamp)
      }))
    };
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
