import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function FeedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const posts = await prisma.post.findMany({
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      media: true,
      _count: { select: { likes: true, comments: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const userId = (session.user as any).id

  return (
    <div className="max-w-[500px] mx-auto py-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={post.user.image || "/placeholder.svg"}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-semibold">{post.user.name}</span>
            </div>
          </div>
          <div className="relative">
            {post.media.map((m, i) => (
              <div key={i} className={`aspect-square w-full ${post.media.length > 1 ? "grid grid-cols-2" : ""}`}>
                {m.type === "VIDEO" ? (
                  <video src={m.url} autoPlay muted loop className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
          <div className="px-3 py-2">
            <div className="flex gap-2 mb-2">
              <button
                className={`flex items-center gap-1 text-blue-600 ${post.likes.some((l) => l.userId === userId) ? "font-bold" : ""}`}
                onClick={() => {
                  fetch(`/api/posts/${post.id}/interact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: post.likes.some((l) => l.userId === userId) ? "unlike" : "like" }),
                  }).then(() => location.reload())
                }}
              >
                &#128077;
              </button>
              <button className="text-gray-600">&#128172;</button>
              <button className="text-gray-600 ml-auto">&#128178;</button>
            </div>
            {post.caption && (
              <p className="text-sm mb-1">
                <span className="font-semibold">{post.user.name}</span>{" "}
                {post.caption}
              </p>
            )}
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="border-t border-gray-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder-gray-400"
                placeholder="Add a comment..."
              />
              <button className="text-blue-600 text-sm font-medium">Post</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
