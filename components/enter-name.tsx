"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface EnterNameProps {
  mode: "create" | "guess"
  onContinue: (name: string) => void
}

export default function EnterName({ mode, onContinue }: EnterNameProps) {
  const [name, setName] = useState("")

  const handleContinue = () => {
    if (name.trim()) {
      onContinue(name.trim())
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2">
              {mode === "create" ? "Create a Challenge" : "Join a Challenge"}
            </h1>
            <p className="text-gray-600">Enter your name to get started</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#ff5c38] focus:outline-none transition-colors"
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleContinue()
                  }
                }}
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!name.trim()}
              className="w-full bg-[#ff5c38] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-[#e54d2e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
