import { Message } from "@/lib/chunk-formatter";
import StockItem, { Stock } from "./StockItem";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const handleEventCallback = (eventMessage: string) => {
    console.log('Component event:', eventMessage);
  };

  switch (message.type) {
    case 'completion':
      return (
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 whitespace-pre-wrap font-[family-name:var(--font-geist-mono)]">
          {message.text}
        </div>
      );
    case 'assets':
      return (
        <div className="grid grid-cols-3 gap-4">
          {
            message.data.map((stock: Stock, index: number) => (
              <StockItem key={index} stock={stock} onItemClick={handleEventCallback} />
            ))
          }
        </div>
      );
    case 'error':
      return (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900 whitespace-pre-wrap font-[family-name:var(--font-geist-mono)]">
          <div className="text-sm text-red-600 dark:text-red-300 mb-2">Error:</div>
          {message.text}
        </div>
      );
    default:
      return null;
  }
};
