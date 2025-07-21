"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X } from "lucide-react"

export default function MatchingPage() {
  const [guesserName, setGuesserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const name = localStorage.getItem("guesserName")
    if (name) {
      setGuesserName(name)
    }

    // Simulate matching process - redirect to guess page after 3 seconds
    const timer = setTimeout(() => {
      router.push("/guess")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#e8e8e8] px-4 py-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3">
          <span className="text-[#928e82] text-lg font-light">(Hot —— Dot)</span>
        </div>
        <Link href="/">
          <X className="w-6 h-6 text-black" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-start pt-20 px-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#ff5c38] rounded-full mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Hey {guesserName}!</h1>
            <p className="text-gray-600 text-lg">Matching you with a creator...</p>
          </div>

          <div className="text-sm text-gray-500">This may take a few moments</div>
        </div>
      </div>
    </div>
  )
}
