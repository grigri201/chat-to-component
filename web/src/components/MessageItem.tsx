import { Message, ReactMessage } from "@/lib/chunk-formatter";
import DynamicCodeRenderer from "@/components/DynamicComponentLoader";

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
    case 'react':
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900">
            <div className="text-sm text-blue-600 dark:text-blue-300 mb-2">Generated React Component:</div>
            <div className="whitespace-pre-wrap font-[family-name:var(--font-geist-mono)] text-sm opacity-75 mb-4">
              {(message as ReactMessage).code}
            </div>
            <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
              <div className="text-sm text-blue-600 dark:text-blue-300 mb-2">Live Preview:</div>
              <DynamicCodeRenderer 
                code={(message as ReactMessage).code} 
                eventCallback={handleEventCallback} 
              />
            </div>
          </div>
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
