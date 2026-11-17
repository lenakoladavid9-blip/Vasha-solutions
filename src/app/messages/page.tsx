import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const conversations = await prisma.conversation.findMany({
    include: {
      participants: { include: { user: { select: { id: true, name: true, username: true, image: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const userId = (session.user as any).id

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-bold mb-6">Messages</h1>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p.userId !== userId)?.user
            const last = c.messages[0]
            return (
              <a
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <img
                  src={other?.image || "/placeholder.svg"}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{other?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{last?.content || "No messages yet"}</p>
                </div>
                <span className="text-xs text-gray-400">{last ? new Date(last.createdAt).toLocaleDateString() : ""}</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
