"use client"

import { useSession, signOut } from "next-auth/react"
import SignInButton from "./sign-in-button"

export default function HeaderAuth() {
  const { data: session } = useSession()

  return (
    <>
      {session?.user?.email ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm">{session.user.email}</span>
          <button
            onClick={() => signOut()}
            className="hover:text-[#FF5C38] transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      ) : (
        <SignInButton />
      )}
    </>
  )
}
