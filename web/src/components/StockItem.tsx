interface Stock {
  symbol: string;
  change: string;
  description: string;
}

interface StockItemProps {
  stock: Stock;
  onItemClick: (symbol: string) => void;
}

export default function StockItem({ stock, onItemClick }: StockItemProps) {
  const isPositiveChange = stock.change.startsWith('+');
  
  return (
    <div 
      className={'p-4 rounded-lg cursor-pointer ' + 
        (isPositiveChange ? 'bg-green-100' : 'bg-red-100')}
      onClick={() => onItemClick(stock.symbol)}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">{stock.symbol}</span>
        <span className={'font-semibold ' + 
          (isPositiveChange ? 'text-green-600' : 'text-red-600')}
        >
          {isPositiveChange ? `+${stock.change}` : `-${stock.change}`}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{stock.description}</p>
    </div>
  );
}

export type { Stock, StockItemProps };
