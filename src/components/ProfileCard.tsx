"use client"

import { useSession } from "next-auth/react"

type Field = "shareName" | "shareEmail" | "shareImage" | "sharePhone"

const FIELD_LABELS: Record<Field, string> = {
  shareName: "Name",
  shareEmail: "Email",
  shareImage: "Image",
  sharePhone: "Phone",
}

interface ProfileCardProps {
  consent: Record<Field, boolean>
}

export default function ProfileCard({ consent }: ProfileCardProps) {
  const { data: session } = useSession()
  const user = session?.user as any

  if (!user) return null

  const rows: Array<{ label: string; value: string | null; show: boolean }> = [
    {
      label: FIELD_LABELS.shareName,
      value: user.name ?? null,
      show: consent.shareName,
    },
    {
      label: FIELD_LABELS.shareEmail,
      value: user.email ?? null,
      show: consent.shareEmail,
    },
    {
      label: FIELD_LABELS.shareImage,
      value: user.image ?? null,
      show: consent.shareImage,
    },
    {
      label: FIELD_LABELS.sharePhone,
      value: user.phone ?? null,
      show: consent.sharePhone,
    },
  ]

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          {consent.shareImage && user.image ? (
            <img src={user.image} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
              {(user.name?.charAt(0) || "?").toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-bold">{user.name ?? "User"}</h2>
            <p className="text-sm text-gray-500">{user.email ?? "No email"}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Shared information
        </h3>
        <div className="space-y-3">
          {rows.map((row) => (
            row.show && row.value ? (
              <div key={row.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-sm text-gray-600">{row.label}</span>
                <span className="text-sm font-medium truncate max-w-xs">
                  {row.label === "Image" ? (
                    <img src={row.value} alt="" className="h-6 w-6 rounded-full inline mr-2" />
                  ) : (
                    ""
                  )}
                  {row.label === "Image" ? "" : row.value}
                </span>
              </div>
            ) : null
          ))}
          {!rows.some((r) => r.show && r.value) && (
            <p className="text-sm text-gray-500 italic">No information shared yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
