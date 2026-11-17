import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminMessages() {
  const session = await getServerSession(authOptions)

  const conversations = await prisma.conversation.findMany({
    include: {
      participants: { include: { user: { select: { name: true, username: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-gray-600">Oversee all direct conversations.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {conversations.map((c) => {
            const others = c.participants.map((p) => p.user.name || p.user.username).join(" & ")
            return (
              <div key={c.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{others}</p>
                  <p className="text-xs text-gray-500">{c.messages[0]?.content || "No messages"}</p>
                </div>
                <p className="text-xs text-gray-400">{new Date(c.updatedAt).toLocaleDateString()}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
