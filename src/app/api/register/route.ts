import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json()
  const result = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1).optional(),
    username: z.string().min(1).optional(),
  }).safeParse(body)

  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 })
  }

  const { email: emailVal, password: passVal, name: nameVal, username: userVal } = result.data

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: emailVal }, { username: userVal }] },
  })
  if (existing) {
    return new Response(JSON.stringify({ error: "User exists" }), { status: 400 })
  }

  const hashed = await hash(passVal, 10)
  const user = await prisma.user.create({
    data: {
      email: emailVal,
      password: hashed,
      name: nameVal,
      username: userVal,
    },
  })

  return new Response(JSON.stringify({ id: user.id, email: user.email }), { status: 201 })
}
