import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const body = await req.json()
  const typeResult = z.object({ type: z.enum(["like", "unlike"]) }).safeParse(body)

  if (!typeResult.success) return new Response(JSON.stringify({ error: "Invalid" }), { status: 400 })

  const { id: postId } = await params
  const userId = (session.user as any).id

  if (typeResult.data.type === "like") {
    await prisma.like.create({ data: { userId, postId } })
  } else {
    await prisma.like.deleteMany({ where: { userId, postId } })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { user: { select: { id: true, name: true, username: true, image: true } } },
    orderBy: { createdAt: "desc" },
  })
  return new Response(JSON.stringify(comments), { status: 200 })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const body = await req.json()
  const contentResult = z.object({ content: z.string().min(1) }).safeParse(body)
  if (!contentResult.success) return new Response(JSON.stringify({ error: "Invalid" }), { status: 400 })

  const { id: postId } = await params
  const userId = (session.user as any).id

  const comment = await prisma.comment.create({
    data: { content: contentResult.data.content, userId, postId },
    include: { user: { select: { id: true, name: true, username: true, image: true } } },
  })
  return new Response(JSON.stringify(comment), { status: 201 })
}
