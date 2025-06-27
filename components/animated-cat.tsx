"use client"

import { useEffect, useState } from "react"

export default function AnimatedCat() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Start animation immediately when component mounts
    setIsVisible(true)
  }, [])

  return (
    <div className="absolute top-20 left-6">
      <svg width="180" height="200" viewBox="0 0 180 200" className="overflow-visible">
        {/* Goofy moustache */}
        <g className="opacity-100">
          <path d="M90 78 q-15 -8 -35 -6" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M90 82 q-15 2 -35 6" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M90 78 q15 -8 35 -6" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M90 82 q15 2 35 6" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Goofy Cat Head - loose wobbly line */}
        <path
          d="M40 60 Q30 25 70 20 Q90 15 110 20 Q150 35 140 60 Q150 90 120 110 Q90 130 60 115 Q35 100 40 60"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-head" : ""}`}
          style={{
            strokeDasharray: 280,
            strokeDashoffset: isVisible ? 0 : 280,
            transition: "stroke-dashoffset 2s ease-in-out 1s",
          }}
        />

        {/* Left Ear - wobbly */}
        <path
          d="M60 38 Q45 5 70 15 Q80 25 75 45"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-ear1" : ""}`}
          style={{
            strokeDasharray: 70,
            strokeDashoffset: isVisible ? 0 : 70,
            transition: "stroke-dashoffset 1.2s ease-in-out 3.2s",
          }}
        />

        {/* Right Ear - wobbly */}
        <path
          d="M120 40 Q135 5 142 22 Q130 30 135 50"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-ear2" : ""}`}
          style={{
            strokeDasharray: 75,
            strokeDashoffset: isVisible ? 0 : 75,
            transition: "stroke-dashoffset 1.1s ease-in-out 3.4s",
          }}
        />

        {/* Eyes - Simple circles */}
        <circle
          cx="70"
          cy="70"
          r="8"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          className={`${isVisible ? "animate-draw-eye1" : ""}`}
          style={{
            strokeDasharray: 38,
            strokeDashoffset: isVisible ? 0 : 38,
            transition: "stroke-dashoffset 0.8s ease-in-out 5s",
          }}
        />

        <circle
          cx="110"
          cy="70"
          r="8"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          className={`${isVisible ? "animate-draw-eye2" : ""}`}
          style={{
            strokeDasharray: 38,
            strokeDashoffset: isVisible ? 0 : 38,
            transition: "stroke-dashoffset 0.8s ease-in-out 5.2s",
          }}
        />

        {/* Nose - larger */}
        <path
          d="M88 90 Q92 85 96 90 Q92 95 88 90"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-nose" : ""}`}
          style={{
            strokeDasharray: 30,
            strokeDashoffset: isVisible ? 0 : 30,
            transition: "stroke-dashoffset 0.6s ease-in-out 6.5s",
          }}
        />

        {/* Mouth - big goofy grin */}
        <path
          d="M78 98 Q90 115 102 98"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-mouth" : ""}`}
          style={{
            strokeDasharray: 50,
            strokeDashoffset: isVisible ? 0 : 50,
            transition: "stroke-dashoffset 1s ease-in-out 7.5s",
          }}
        />

        {/* Body - loose oval */}
        <path
          d="M55 130 Q90 110 125 130 Q110 150 90 152 Q70 150 55 130"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`${isVisible ? "animate-draw-body" : ""}`}
          style={{
            strokeDasharray: 180,
            strokeDashoffset: isVisible ? 0 : 180,
            transition: "stroke-dashoffset 1.8s ease-in-out 9s",
          }}
        />

        {/* Four legs - Child-like straight lines */}
        <g
          className={`${isVisible ? "animate-draw-legs" : ""}`}
          style={{
            strokeDasharray: 120,
            strokeDashoffset: isVisible ? 0 : 120,
            transition: "stroke-dashoffset 1.5s ease-in-out 11s",
          }}
        >
          {/* Front left leg */}
          <path
            d="M65 145 q-1 12 -3 24 l10 0"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Front right leg */}
          <path
            d="M85 145 q-1 12 -3 24 l10 0"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Back left leg */}
          <path
            d="M95 145 q1 12 3 24 l10 0"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Back right leg */}
          <path
            d="M115 145 q1 12 3 24 l10 0"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Tail - playful swirl */}
        <path
          d="M125 125 q25 -20 20 -40 q20 10 10 30 q5 20 -15 25"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-tail" : ""}`}
          style={{
            strokeDasharray: 90,
            strokeDashoffset: isVisible ? 0 : 90,
            transition: "stroke-dashoffset 1.5s ease-in-out 12.8s",
          }}
        />
      </svg>
    </div>
  )
}
