import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const user = (session?.user as any) ?? {}

  if (!session || user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20">
        <div className="p-6 flex items-center gap-2">
          <span className="text-xl font-bold">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium"
          >
            Dashboard
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Users
          </a>
          <a
            href="/admin/posts"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Posts
          </a>
          <a
            href="/admin/messages"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Messages
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Sign out
          </a>
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  )
}
