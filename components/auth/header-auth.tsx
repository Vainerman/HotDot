"use client"

import { useSession } from "next-auth/react"
import SignInButton from "./sign-in-button"
import Link from "next/link"

export default function HeaderAuth() {
  const { data: session } = useSession()

  return (
    <>
      {session?.user?.email ? (
        <span className="text-sm">{session.user.email}</span>
      ) : (
        <SignInButton />
      )}
    </>
  )
}
