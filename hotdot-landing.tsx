import { Menu } from "lucide-react"
import Link from "next/link"
import AnimatedCat from "./components/animated-cat"

export default function Component() {
  return (
    <div className="min-h-screen bg-[#faf9f6] relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <span className="text-[#928e82] text-lg font-light">(Hot —— Dot)</span>
      </div>

      {/* Animated Cat */}
      <AnimatedCat />

      {/* Bottom Left Menu and Text */}
      <div className="absolute bottom-8 left-6">
        <div className="flex items-center gap-3 mb-8">
          <Menu className="w-6 h-6 text-[#928e82]" />
          <span className="text-[#928e82] text-lg">Menu</span>
        </div>

        <div className="space-y-2">
          <Link href="/create/enter-name">
            <div className="text-[#1a1a1a] text-4xl md:text-5xl font-bold leading-tight cursor-pointer hover:text-[#ff5c38] transition-colors">
              CREATE
            </div>
          </Link>
          <Link href="/guess/enter-name">
            <div className="text-[#1a1a1a] text-4xl md:text-5xl font-bold leading-tight cursor-pointer hover:text-[#ff5c38] transition-colors">
              GUESS
            </div>
          </Link>
          <div className="text-[#1a1a1a] text-4xl md:text-5xl font-bold leading-tight cursor-pointer hover:text-[#ff5c38] transition-colors">
            PROFILE
          </div>
          <div className="text-[#1a1a1a] text-4xl md:text-5xl font-bold leading-tight cursor-pointer hover:text-[#ff5c38] transition-colors">
            GALLERY
          </div>
        </div>
      </div>
    </div>
  )
}
