"use client"

import { useEffect, useState } from "react"

export default function AnimatedCat() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Start animation immediately when component mounts
    setVisible(true)
  }, [])

  // Common animation style for the paths
  const drawStyle = {
    strokeDasharray: 400,
    strokeDashoffset: visible ? 0 : 400,
    transition: "stroke-dashoffset 2s ease-in-out",
  } as const

  return (
    <div className="absolute top-20 left-6">
      <svg
        width={180}
        height={200}
        viewBox="0 0 180 200"
        className="overflow-visible"
        fill="none"
        stroke="#ff8800"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head with ears */}
        <path d="M60 70 Q60 40 90 40 Q120 40 120 70 Q120 95 90 95 Q60 95 60 70 Z" style={drawStyle} />
        {/* Left ear */}
        <path d="M75 45 L70 25 L85 40" style={drawStyle} />
        {/* Right ear */}
        <path d="M105 45 L110 25 L95 40" style={drawStyle} />
      </svg>
    </div>
  )
}
