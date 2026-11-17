import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { promises as fsp } from "fs"
import { join } from "path"
import { randomBytes } from "crypto"

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

  const form = await req.formData()
  const caption = form.get("caption") as string
  const files = form.getAll("media") as File[]

  const uploadDir = join(process.cwd(), "public", "uploads")
  await fsp.mkdir(uploadDir, { recursive: true })

  const mediaEntries = []
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split(".").pop()
    const filename = `${randomBytes(16).toString("hex")}.${ext}`
    const path = join(uploadDir, filename)
    await fsp.writeFile(path, buffer)
    const type = file.type.startsWith("video") ? "VIDEO" : "IMAGE"
    mediaEntries.push({ url: `/uploads/${filename}`, type })
  }

  const post = await prisma.post.create({
    data: {
      caption,
      userId: (session.user as any).id,
      media: { create: mediaEntries },
    },
    include: { media: true, user: true },
  })

  return new Response(JSON.stringify(post), { status: 201 })
}

export const GET = async () => {
  const posts = await prisma.post.findMany({
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      media: true,
      _count: { select: { likes: true, comments: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return new Response(JSON.stringify(posts), { status: 200 })
}
