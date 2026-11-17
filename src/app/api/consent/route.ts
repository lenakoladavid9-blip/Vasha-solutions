import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  shareName: z.boolean(),
  shareEmail: z.boolean(),
  shareImage: z.boolean(),
  sharePhone: z.boolean(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const userId = (session.user as any).id

  await prisma.consent.upsert({
    where: { userId },
    update: parsed.data,
    create: { userId, ...parsed.data },
  })

  return NextResponse.json({ ok: true })
}
