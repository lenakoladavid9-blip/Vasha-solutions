import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const { id: targetId } = await params
  const userId = (session.user as any).id
  if (userId === targetId) return new Response(JSON.stringify({ error: "Cannot follow self" }), { status: 400 })

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userId, followingId: targetId } },
    update: {},
    create: { followerId: userId, followingId: targetId },
  })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const { id: targetId } = await params
  const userId = (session.user as any).id

  await prisma.follow.deleteMany({ where: { followerId: userId, followingId: targetId } })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params
  const [followersCount, followingsCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetId } }),
    prisma.follow.count({ where: { followerId: targetId } }),
    prisma.follow.findFirst({ where: { followingId: targetId, followerId: (await getServerSession(authOptions))?.user?.id } }),
  ])
  return new Response(JSON.stringify({ followersCount, followingsCount, isFollowing: !!isFollowing }), { status: 200 })
}
