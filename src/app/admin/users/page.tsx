import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminUsers() {
  const session = await getServerSession(authOptions)

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      image: true,
      _count: { select: { posts: true, followers: true, followings: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-gray-600">Manage and oversee all registered accounts.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">User</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Posts</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Followers</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.image ? (
                      <img src={u.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {(u.name?.charAt(0) || "?").toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{u.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u._count.posts}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u._count.followers}</td>
                <td className="px-4 py-3 text-sm">
                  {u.role !== "admin" && (
                    <button
                      className="text-red-600 text-xs font-medium hover:underline"
                      onClick={() => {
                        if (confirm(`Make ${u.name} an admin?`)) {
                          fetch("/api/admin/users/" + u.id, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ role: "admin" }),
                          }).then(() => location.reload())
                        }
                      }}
                    >
                      Set Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
