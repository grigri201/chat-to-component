import { cn } from "@/lib/utils";

interface PortfolioChartProps {
  onDetailsClick: () => void;
}

const data = [
  { date: 'Jan', value: 100 },
  { date: 'Feb', value: 120 },
  { date: 'Mar', value: 115 },
  { date: 'Apr', value: 130 },
  { date: 'May', value: 145 },
  { date: 'Jun', value: 140 },
];

const maxValue = Math.max(...data.map(d => d.value));
const minValue = Math.min(...data.map(d => d.value));
const range = maxValue - minValue;

export default function PortfolioChart({ onDetailsClick }: PortfolioChartProps) {
  return (
    <div className="bg-blue-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Portfolio</h2>
          <p className="text-sm text-muted-foreground">$145,000.00</p>
        </div>
        <button 
          onClick={onDetailsClick}
          className="hover:bg-blue-100 p-2 rounded-full transition-colors"
        >
          →
        </button>
      </div>
      <div className="h-40 bg-white rounded p-4">
        <div className="relative h-full w-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>${maxValue}k</span>
            <span>${minValue}k</span>
          </div>
          
          {/* Chart area */}
          <div className="absolute left-8 right-4 h-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Line */}
              <path
                d={`M ${data.map((d, i) => `${(i * 100) / (data.length - 1)} ${100 - ((d.value - minValue) / range) * 100}`).join(' L ')}`}
                className="stroke-blue-500 stroke-2 fill-none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Area under the line */}
              <path
                d={`M 0 100 ${data.map((d, i) => `L ${(i * 100) / (data.length - 1)} ${100 - ((d.value - minValue) / range) * 100}`).join(' ')} L 100 100 Z`}
                className="fill-blue-100/50"
              />
            </svg>
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs text-gray-500">
            {data.map(d => (
              <span key={d.date}>{d.date}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { PortfolioChartProps };
