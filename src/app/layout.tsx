import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { SessionProvider } from "@/components/SessionProvider"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className="hidden md:flex flex-col w-14 items-center justify-between py-6 border-r border-gray-200 bg-white z-10">
        <div className="flex flex-col items-center gap-6">
          <Link href="/feed" className="text-blue-600 text-xl">&#127760;</Link>
          <Link href="/create-post" className="text-gray-400 hover:text-gray-600 text-xl">&#128247;</Link>
          <Link href="/messages" className="text-gray-400 hover:text-gray-600 text-xl">&#128172;</Link>
          <Link href={`/profile/${session?.user?.username || session?.user?.id}`} className="text-gray-400 hover:text-gray-600 text-xl">&#128100;</Link>
        </div>
        <a
          href="/api/auth/signout"
          className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm hover:bg-red-200 transition"
        >
          &#128273;
        </a>
      </nav>

      <SessionProvider session={session}>
        <div className="flex-1 overflow-y-auto bg-[#fafafa]">{children}</div>
      </SessionProvider>
    </div>
  )
}
