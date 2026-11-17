import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminPosts() {
  const session = await getServerSession(authOptions)

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, username: true, id: true } },
      media: true,
      _count: { select: { likes: true, comments: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-gray-600">Moderate all content on the platform.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {posts.map((p) => (
            <div key={p.id} className="p-4 flex gap-3">
              {p.media[0] && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  {p.media[0].type === "VIDEO" ? (
                    <video src={p.media[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={p.media[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{p.user?.name || "Unknown"}</p>
                <p className="text-gray-600 text-sm truncate">{p.caption || "No caption"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {p._count.likes} likes • {p._count.comments} comments
                </p>
              </div>
              <button
                className="text-red-600 text-xs font-medium hover:underline ml-auto"
                onClick={() => {
                  if (confirm("Delete this post?")) {
                    fetch("/api/admin/posts/" + p.id, { method: "DELETE" }).then(() => location.reload())
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
