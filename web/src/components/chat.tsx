'use client'

import { useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChatMessage } from './chat-message'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: 'chat' | 'search' | 'reason', e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Create an empty assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const endpoint = action === 'chat' ? 'completion' :
                       action === 'search' ? 'search' : 'reason'

      const response = await fetch(`http://localhost:3000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      })

      if (!response.ok) throw new Error('Failed to get response')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let content = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          try {
            content += line
            setMessages(prev =>
              prev.map((msg, i) =>
                i === prev.length - 1
                  ? { ...msg, content }
                  : msg
              )
            )
          } catch (e) {
            console.error('Failed to parse chunk:', e)
          }
        }
      } 
    } catch (error) {
      console.error('Error:', error)
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => handleAction('chat', e)

  const latestAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
  const latestUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

  return (
    <div className="flex flex-col h-screen">
      {/* Top section - Latest API Response */}
      <div className="h-1/3 overflow-y-auto border-b dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          {latestAssistantMessage && (
            <ChatMessage message={latestAssistantMessage} />
          )}
          {isLoading && (
            <div className="flex items-center space-x-2 p-4">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Middle section - Latest User Message */}
      <div className="h-1/3 overflow-y-auto border-b dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          {latestUserMessage && (
            <ChatMessage message={latestUserMessage} />
          )}
        </div>
      </div>

      {/* Bottom section - Input Form */}
      <div className="mt-auto border-t dark:border-gray-800 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto px-4 py-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="询问任何问题"
            className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 pr-24 shadow-lg focus:border-gray-300 focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-gray-600"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 space-x-2">
            <button
              type="button"
              onClick={() => handleAction('search')}
              disabled={isLoading}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
              title="搜索"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleAction('reason')}
              disabled={isLoading}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
              title="推理"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={isLoading}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
