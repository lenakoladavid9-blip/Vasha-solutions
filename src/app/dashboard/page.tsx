import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ConsentForm from "@/components/ConsentForm"
import ProfileCard from "@/components/ProfileCard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: { consent: true },
  })

  const consent = user?.consent
    ? {
        shareName: user.consent.shareName,
        shareEmail: user.consent.shareEmail,
        shareImage: user.consent.shareImage,
        sharePhone: user.consent.sharePhone,
      }
    : {
        shareName: false,
        shareEmail: false,
        shareImage: false,
        sharePhone: false,
      }

  return (
    <main className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Manage your connected account and sharing preferences.</p>
        </div>
        <a
          href="/api/auth/signout"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
        >
          Sign out
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="col-span-full lg:col-span-2">
          <ProfileCard consent={consent} />
        </div>
        <div>
          <ConsentForm />
        </div>
      </div>
    </main>
  )
}
