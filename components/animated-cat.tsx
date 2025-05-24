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
        {/* Moustache - Clean and straight, appears immediately in black */}
        <g className="opacity-100">
          <path d="M18 68 Q30 66 42 68" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 76 Q30 74 44 76" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 84 Q30 82 42 84" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M118 68 Q130 66 142 68" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M116 76 Q130 74 144 76" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M118 84 Q130 82 142 84" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Cat Head - Single sketchy line, moved left to align with moustache */}
        <path
          d="M40 60 Q38 30 70 32 Q90 28 110 30 Q130 32 140 60 Q142 80 130 100 Q110 120 90 118 Q70 116 50 100 Q38 80 40 60"
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

        {/* Left Ear - Single sketchy line */}
        <path
          d="M55 40 Q45 20 60 25 Q70 30 65 45"
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

        {/* Right Ear - Single sketchy line */}
        <path
          d="M115 45 Q110 30 125 25 Q135 20 125 40"
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
          cx="65"
          cy="65"
          r="6"
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
          cx="115"
          cy="65"
          r="6"
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

        {/* Nose - Simple triangle */}
        <path
          d="M85 80 Q90 75 95 80 Q90 85 85 80"
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

        {/* Mouth - Simple curved lines */}
        <path
          d="M90 85 Q80 95 75 90 M90 85 Q100 95 105 90"
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

        {/* Body - Horizontal oval for standing cat */}
        <ellipse
          cx="90"
          cy="130"
          rx="35"
          ry="18"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`${isVisible ? "animate-draw-body" : ""}`}
          style={{
            strokeDasharray: 160,
            strokeDashoffset: isVisible ? 0 : 160,
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
            d="M65 145 L65 170 M60 170 L70 170"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Front right leg */}
          <path
            d="M85 145 L85 170 M80 170 L90 170"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Back left leg */}
          <path
            d="M95 145 L95 170 M90 170 L100 170"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Back right leg */}
          <path
            d="M115 145 L115 170 M110 170 L120 170"
            fill="none"
            stroke="#ff5c38"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Tail - Simple curved line */}
        <path
          d="M125 125 Q145 110 160 95"
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
