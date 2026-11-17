"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreatePostPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) router.push("/login")

  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files ?? []))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData()
    form.append("caption", caption)
    files.forEach((f) => form.append("media", f))
    await fetch("/api/posts", { method: "POST", body: form })
    router.push("/feed")
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-xl font-bold mb-6">New post</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <textarea
          className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer mb-4"
        />
        {files.map((f) => (
          <div key={f.name} className="flex items-center gap-2 mb-2 text-sm text-gray-600">
            &#128247; {f.name}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Share
        </button>
      </form>
    </div>
  )
}
