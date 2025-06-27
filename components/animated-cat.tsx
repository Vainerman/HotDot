"use client"

import { useEffect, useState } from "react"

export default function AnimatedCat() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Start animation immediately when component mounts
    setVisible(true)
  }, [])

  return (
    <div className="absolute top-20 left-6">
      <svg width="180" height="200" viewBox="0 0 180 200" className="overflow-visible">

          fill="none"
          stroke="#ff8800"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"

          style={{
            strokeDasharray: 400,
            strokeDashoffset: visible ? 0 : 400,
            transition: "stroke-dashoffset 2s ease-in-out",
          }}
        >
          {/* Head with ears */}
          <path d="M60 70 Q60 40 90 40 Q120 40 120 70 Q120 95 90 95 Q60 95 60 70 Z" />
          <path d="M75 45 L70 25 L85 40" />
          <path d="M105 45 L110 25 L95 40" />


      </svg>
    </div>
  )
}
