import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const body = await req.json()
  const { recipientId } = body

  const userId = (session.user as any).id
  if (userId === recipientId) return new Response(JSON.stringify({ error: "Invalid" }), { status: 400 })

  let conversation = await prisma.conversation.findFirst({
    where: {
      participants: { some: { userId } },
    },
    include: { participants: true },
  })

  conversation = conversation?.participants.some((p) => p.userId === recipientId)
    ? conversation
    : await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId }, { userId: recipientId }],
          },
        },
        include: { participants: { include: { user: true } } },
      })

  return new Response(JSON.stringify(conversation), { status: 200 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const userId = (session.user as any).id
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: { include: { user: { select: { id: true, name: true, username: true, image: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  })
  return new Response(JSON.stringify(conversations), { status: 200 })
}
