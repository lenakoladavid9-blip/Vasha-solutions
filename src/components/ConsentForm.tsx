"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

type Field = "shareName" | "shareEmail" | "shareImage" | "sharePhone"

const FIELD_LABELS: Record<Field, string> = {
  shareName: "Full name",
  shareEmail: "Email address",
  shareImage: "Profile image",
  sharePhone: "Phone number",
}

export default function ConsentForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [consent, setConsent] = useState<Record<Field, boolean>>({
    shareName: false,
    shareEmail: false,
    shareImage: false,
    sharePhone: false,
  })

  const user = session?.user as any

  const handleToggle = (field: Field) => {
    setConsent((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consent),
      })
      if (!res.ok) throw new Error("Failed to save consent")
      router.refresh()
      router.push("/dashboard")
    } catch (err) {
      alert("Failed to save consent preferences")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <section className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Profile visibility</h2>
        <p className="text-sm text-gray-600">
          Choose which of your connected account details appear on your public
          profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {Object.entries(consent).map(([field, checked]) => (
          <label key={field} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(field as Field)}
                className="rounded text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm font-medium">{FIELD_LABELS[field as Field]}</span>
            </div>
            <span className="text-xs font-medium">
              {checked ? "Visible" : "Hidden"}
            </span>
          </label>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl disabled:opacity-50 hover:bg-gray-800 transition"
        >
          {loading ? "Saving..." : "Save preferences"}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center">
        You can change these settings anytime. Only fields you mark visible are
        shown on your profile.
      </p>
    </section>
  )
}
