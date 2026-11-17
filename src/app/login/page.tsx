"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { data: session } = useSession()
  const router = useRouter()

  if (session) router.push("/feed")

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.error) setError("Invalid credentials")
      else router.push("/feed")
    } catch {
      setError("Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="flex justify-center">
          <Link href="/" className="text-2xl font-bold">Social</Link>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCredentials}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Log in
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
        <div className="border-t mt-6 pt-4">
          <p className="text-center text-xs text-gray-500 uppercase mb-4">Or continue with</p>
          <div className="grid gap-3">
            <button
              onClick={() => signIn("google")}
              className="w-full border rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              Google
            </button>
            <button
              onClick={() => signIn("github")}
              className="w-full border rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
