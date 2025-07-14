import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import SignInButton from "./sign-in-button"

export default async function HeaderAuth() {
  const session = await getServerSession(authOptions)

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