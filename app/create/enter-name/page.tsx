"use client"

import { useRouter } from "next/navigation"
import EnterName from "../../../components/enter-name"

export default function CreateEnterNamePage() {
  const router = useRouter()

  const handleContinue = (name: string) => {
    // Store the name in localStorage or pass it via URL params
    localStorage.setItem("creatorName", name)
    router.push("/create/canvas")
  }

  return <EnterName mode="create" onContinue={handleContinue} />
}
