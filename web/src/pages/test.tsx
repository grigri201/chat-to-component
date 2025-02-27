"use client";

import StockItem, { type Stock } from '@/components/StockItem';
import PortfolioChart from '@/components/PortfolioChart';

export default function TestPage() {
  const stocks: Stock[] = [
    { symbol: 'AAPL', change: '+2%', description: 'See why AAPL is rising...' },
    { symbol: 'MSFT', change: '-3%', description: 'See how MSFT has performed...' },
    { symbol: 'GIKO', change: '+10%', description: 'The best performing assets are...' }
  ];

  const handleEvent = (event: string) => {
    console.log(event);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {stocks.map(stock => (
            <StockItem
              key={stock.symbol}
              stock={stock}
              onItemClick={(symbol) => handleEvent('Clicked ' + symbol)}
            />
          ))}
        </div>

        <PortfolioChart onDetailsClick={() => handleEvent('View details')} />

        <div className="grid grid-cols-2 gap-4">
          <button
            className="p-4 bg-green-500 text-white rounded-lg font-semibold"
            onClick={() => handleEvent('Buy asset')}
          >
            Buy asset
          </button>
          <button
            className="p-4 bg-red-500 text-white rounded-lg font-semibold"
            onClick={() => handleEvent('Sell asset')}
          >
            Sell asset
          </button>
        </div>
      </div>
    </div>
  );
}
