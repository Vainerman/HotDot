"use client"

import { useRouter } from "next/navigation"
import EnterName from "../../../components/enter-name"

export default function GuessEnterNamePage() {
  const router = useRouter()

  const handleContinue = (name: string) => {
    // Store the name in localStorage or pass it via URL params
    localStorage.setItem("guesserName", name)
    router.push("/guess/matching")
  }

  return <EnterName mode="guess" onContinue={handleContinue} />
}
