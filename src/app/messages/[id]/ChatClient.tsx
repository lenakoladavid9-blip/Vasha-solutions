"use client"

import { useState, useEffect } from "react"

interface ChatPageProps {
  userId: string
  conversation: {
    id: string
    participants: Array<{ userId: string; user: { id: string; name: string | null; username: string | null; image: string | null } }>
    messages: Array<{ id: string; conversationId: string; senderId: string; content: string | null; mediaUrl: string | null; mediaType: string | null; read: boolean; createdAt: string; sender: { id: string; name: string | null; username: string | null; image: string | null } }>
  }
}

export default function ChatPage({ userId, conversation }: ChatPageProps) {
  const other = conversation.participants.find((p) => p.userId !== userId)?.user

  const [content, setContent] = useState("")
  const [messages, setMessages] = useState(conversation.messages)

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`)
      const data = await res.json()
      setMessages(data)
    }, 3000)
    return () => clearInterval(interval)
  }, [conversation.id])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/conversations/${conversation.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    setContent("")
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <img src={other?.image || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-full" />
        <div>
          <h1 className="font-semibold">{other?.name || "User"}</h1>
          <p className="text-xs text-gray-500">Active now</p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={`max-w-[80%] p-3 rounded-2xl ${
              m.senderId === userId
                ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                : "bg-gray-100 text-black rounded-br-none"
            }`}
          >
            <p className="text-sm">{m.content}</p>
            <p className="text-[10px] text-opacity-60 mt-1 text-right">
              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </main>
      <form onSubmit={send} className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition">Send</button>
      </form>
    </div>
  )
}
