import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const { id } = await params
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true, username: true, image: true } } },
    orderBy: { createdAt: "asc" },
  })
  return new Response(JSON.stringify(messages), { status: 200 })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const { id } = await params
  const body = await req.json()
  const contentResult = z.object({ content: z.string().min(1).optional() }).safeParse(body)
  if (!contentResult.success) return new Response(JSON.stringify({ error: "Invalid" }), { status: 400 })

  const userId = (session.user as any).id
  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      content: contentResult.data?.content || null,
    },
    include: { sender: { select: { id: true, name: true, username: true, image: true } } },
  })

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return new Response(JSON.stringify(message), { status: 201 })
}
