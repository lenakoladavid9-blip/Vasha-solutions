import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const [userCount, postCount, messageCount, recentUsers, recentPosts] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.message.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, username: true, email: true, role: true, createdAt: true },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, username: true } } },
      }),
    ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Oversee platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase">Total Users</p>
          <p className="text-3xl font-bold">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase">Total Posts</p>
          <p className="text-3xl font-bold">{postCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase">Total Messages</p>
          <p className="text-3xl font-bold">{messageCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 uppercase">Your Role</p>
          <p className="text-3xl font-bold">{userId ? "Admin" : "-"}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 border-b border-gray-50 text-sm">
                <div>
                  <p className="font-medium">{u.name || "Unknown"}</p>
                  <p className="text-gray-500">{u.username || u.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((p) => (
              <div key={p.id} className="p-2 border-b border-gray-50 text-sm">
                <p className="font-medium">{p.user?.name}</p>
                <p className="text-gray-600 truncate">{p.caption || "No caption"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
