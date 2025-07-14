"use client"

import { signIn } from "next-auth/react"

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("email", { callbackUrl: "/create/enter-name" })}
      className="hover:text-[#FF5C38] transition-colors"
    >
      SIGN IN
    </button>
  )
}
