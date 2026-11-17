import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const userId = (session.user as any).id

  const { username } = await params

  const profileUser = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        include: { media: true, _count: { select: { likes: true, comments: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { followers: true, followings: true, posts: true } },
      followers: { where: { followerId: userId } },
    },
  })

  if (!profileUser) redirect("/feed")

  const isOwn = profileUser.id === userId
  const isFollowing = profileUser.followers.length > 0

  return (
    <div className="max-w-[500px] mx-auto py-6 px-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <img
          src={profileUser.image || "/placeholder.svg"}
          alt=""
          className="w-16 h-16 rounded-full mb-3"
        />
        <h1 className="text-xl font-bold">{profileUser.name}</h1>
        <p className="text-gray-600 text-sm">@{profileUser.username}</p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="font-semibold">{profileUser._count.posts}</span> Posts
          <span className="font-semibold">{profileUser._count.followers}</span> Followers
          <span className="font-semibold">{profileUser._count.followings}</span> Following
        </div>
        {!isOwn && (
          <button
            className={`mt-3 w-full py-2 rounded-lg font-semibold border ${
              isFollowing ? "bg-gray-100 text-gray-900 border-gray-300" : "bg-blue-600 text-white border-blue-600"
            }`}
            onClick={() => {
              fetch(`/api/users/${profileUser.id}/follow`, {
                method: isFollowing ? "DELETE" : "POST",
              }).then(() => location.reload())
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {profileUser.posts.map((post) => (
          <div key={post.id} className="aspect-square overflow-hidden rounded-lg">
            {post.media[0] ? (
              post.media[0].type === "VIDEO" ? (
                <video src={post.media[0].url} autoPlay muted loop className="w-full h-full object-cover" />
              ) : (
                <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                No media
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
