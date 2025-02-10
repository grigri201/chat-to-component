'use client'

import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type ChatMessageProps = {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className="mb-4 px-4">
      <div
        className={cn(
          'flex max-w-3xl items-start space-x-4 rounded-lg px-4 py-2',
          isUser ? 'ml-auto' : 'mr-auto'
        )}
      >
        <div className="flex-1">
          {message.content ? (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="my-4 overflow-hidden rounded-lg"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      {...props}
                      className={cn(
                        'rounded-md bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800',
                        className
                      )}
                    >
                      {children}
                    </code>
                  )
                },
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300">
                    {children}
                  </p>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
