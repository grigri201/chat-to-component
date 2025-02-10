import { Chat } from '@/components/chat'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">有什么可以帮忙的?</h1>
        <Chat />
      </div>
    </main>
  )
}
