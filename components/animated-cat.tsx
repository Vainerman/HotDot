"use client"

import { useEffect, useState } from "react"

export default function AnimatedCat() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Start animation immediately when component mounts
    setIsVisible(true)
  }, [])

  return (
    <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
      <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">
        {/* Moustache - Appears immediately in black */}
        <g className="opacity-100">
          <path d="M30 90 Q45 88 60 90" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 100 Q45 98 60 100" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 110 Q45 108 60 110" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M140 90 Q155 88 170 90" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M140 100 Q155 98 175 100" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M140 110 Q155 108 170 110" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Cat Head */}
        <path
          d="M50 80 Q50 50 80 50 Q110 50 140 50 Q150 50 150 80 Q150 110 140 130 Q110 140 100 140 Q90 140 60 130 Q50 110 50 80"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-head" : ""}`}
          style={{
            strokeDasharray: 300,
            strokeDashoffset: isVisible ? 0 : 300,
            transition: "stroke-dashoffset 2s ease-in-out 1s",
          }}
        />

        {/* Left Ear */}
        <path
          d="M65 60 Q55 40 70 45 Q80 50 75 65"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-ear1" : ""}`}
          style={{
            strokeDasharray: 80,
            strokeDashoffset: isVisible ? 0 : 80,
            transition: "stroke-dashoffset 1.5s ease-in-out 3.2s",
          }}
        />

        {/* Right Ear */}
        <path
          d="M125 65 Q120 50 135 45 Q145 40 135 60"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-ear2" : ""}`}
          style={{
            strokeDasharray: 80,
            strokeDashoffset: isVisible ? 0 : 80,
            transition: "stroke-dashoffset 1.5s ease-in-out 3.4s",
          }}
        />

        {/* Left Eye */}
        <circle
          cx="75"
          cy="85"
          r="8"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          className={`${isVisible ? "animate-draw-eye1" : ""}`}
          style={{
            strokeDasharray: 50,
            strokeDashoffset: isVisible ? 0 : 50,
            transition: "stroke-dashoffset 1s ease-in-out 5s",
          }}
        />

        {/* Right Eye */}
        <circle
          cx="125"
          cy="85"
          r="8"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          className={`${isVisible ? "animate-draw-eye2" : ""}`}
          style={{
            strokeDasharray: 50,
            strokeDashoffset: isVisible ? 0 : 50,
            transition: "stroke-dashoffset 1s ease-in-out 5.2s",
          }}
        />

        {/* Nose */}
        <path
          d="M95 100 Q100 95 105 100 Q100 105 95 100"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-nose" : ""}`}
          style={{
            strokeDasharray: 40,
            strokeDashoffset: isVisible ? 0 : 40,
            transition: "stroke-dashoffset 0.8s ease-in-out 6.5s",
          }}
        />

        {/* Mouth */}
        <path
          d="M100 105 Q90 115 85 110 M100 105 Q110 115 115 110"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-mouth" : ""}`}
          style={{
            strokeDasharray: 60,
            strokeDashoffset: isVisible ? 0 : 60,
            transition: "stroke-dashoffset 1.2s ease-in-out 7.5s",
          }}
        />

        {/* Body */}
        <ellipse
          cx="100"
          cy="160"
          rx="35"
          ry="25"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          className={`${isVisible ? "animate-draw-body" : ""}`}
          style={{
            strokeDasharray: 200,
            strokeDashoffset: isVisible ? 0 : 200,
            transition: "stroke-dashoffset 2s ease-in-out 9s",
          }}
        />

        {/* Tail */}
        <path
          d="M135 155 Q160 140 170 120 Q175 110 165 115 Q155 125 150 140"
          fill="none"
          stroke="#ff5c38"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${isVisible ? "animate-draw-tail" : ""}`}
          style={{
            strokeDasharray: 120,
            strokeDashoffset: isVisible ? 0 : 120,
            transition: "stroke-dashoffset 1.8s ease-in-out 11.2s",
          }}
        />

        {/* Paws */}
        <g
          className={`${isVisible ? "animate-draw-paws" : ""}`}
          style={{
            strokeDasharray: 80,
            strokeDashoffset: isVisible ? 0 : 80,
            transition: "stroke-dashoffset 1.5s ease-in-out 13.2s",
          }}
        >
          <ellipse cx="80" cy="180" rx="8" ry="5" fill="none" stroke="#ff5c38" strokeWidth="2" />
          <ellipse cx="120" cy="180" rx="8" ry="5" fill="none" stroke="#ff5c38" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}
