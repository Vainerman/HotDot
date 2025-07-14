"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    await signIn("email", { email, redirect: false, callbackUrl: "/create/enter-name" })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p>A magic link has been sent to {email}.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-8 border rounded-lg shadow-lg w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-center text-gray-500">
          Enter your email to receive a magic link.
        </p>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <Button type="submit">Sign In with Email</Button>
      </form>
    </div>
  )
} 