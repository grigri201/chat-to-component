import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import * as api from "../lib/api";
import { storage } from "@/lib/storage";
import { CompletionMessage, Message } from "@/lib/chunk-formatter";
import { MessageItem } from "@/components/MessageItem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    let currentResponse: CompletionMessage = { type: "completion", text: "" };

    try {
      await api.getCompletion(
        prompt,
        (messages: Message[]) => {
          for (const message of messages) {
            if (message.type === "completion") {
              currentResponse.text += message.text;
              setMessages((prev) => [...prev.slice(0, -1), currentResponse]);
            } else if (message.type === "session") {
              storage.setSessionId(message.sessionId);
            } else if (message.type === "react") {
              console.log({
                message
              })
              // Save current completion response if it exists
              if (currentResponse.text) {
                setMessages((prev) => [...prev, currentResponse]);
              }
              // Add react message
              setMessages((prev) => [...prev, message]);
              // Reset currentResponse
              currentResponse = { type: "completion", text: "" };
            }
          }
        },
        (error) => {
          console.error("Error:", error);
          setMessages((prev) => [
            ...prev,
            { type: "error", text: `Error: ${error.message}` },
          ]);
        },
        storage.getSessionId()
      );
    } finally {
      setIsLoading(false);
      setPrompt("");
      // Add any remaining completion response
      if (currentResponse.text) {
        setMessages((prev) => [...prev.slice(0, -1), currentResponse]);
      }
    }
  };

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
      {/* Top section - 80% height */}
      <div className="flex h-[80vh]">
        <div className="w-[20%] p-4 flex items-center justify-center">
          <Image
            className="dark:invert"
            src="/window.svg"
            alt="Next.js logo"
            width={90}
            height={38}
            priority
          />
        </div>

        {/* Right side - Chat history */}
        <div className="w-[80%] p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message: Message, index) => (
              <MessageItem key={index} message={message} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section - 20% height */}
      <div className="h-[20vh] p-4 border-t flex items-center">
        <form onSubmit={handleSubmit} className="flex w-full gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-blue-500"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
