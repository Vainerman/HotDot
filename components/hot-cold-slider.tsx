"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface HotColdSliderProps {
  value: number // 0-100
  onChange?: (value: number) => void
  disabled?: boolean
}

const SLIDER_POSITIONS = [0, 25, 50, 75, 100]
const SLIDER_LABELS = ["VERY COLD", "COLD", "WARM", "HOT", "VERY HOT"]

export default function HotColdSlider({ value, onChange, disabled = false }: HotColdSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Find the closest position index
  const getClosestPositionIndex = (percentage: number) => {
    let closestIndex = 0
    let minDistance = Math.abs(percentage - SLIDER_POSITIONS[0])

    for (let i = 1; i < SLIDER_POSITIONS.length; i++) {
      const distance = Math.abs(percentage - SLIDER_POSITIONS[i])
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }

    return closestIndex
  }

  // Get the current active position index
  const activeIndex = getClosestPositionIndex(value)

  // Calculate the offset to center the active label on the handle
  const calculateLabelOffset = () => {
    // We want to move the labels so the active one is at 50% (center)
    // The active label is naturally at (activeIndex * 25)% position
    // We need to shift by (50 - activeIndex * 25)%
    const targetCenter = 50 // We want active label at center (50%)
    const activeLabelPosition = activeIndex * 25 // Current position of active label
    return targetCenter - activeLabelPosition
  }

  const labelOffset = calculateLabelOffset()

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return
    updateValue(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updateValue = (clientX: number) => {
    if (!sliderRef.current || !onChange) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))

    // Snap to the closest position
    const closestIndex = getClosestPositionIndex(percentage)
    const snappedValue = SLIDER_POSITIONS[closestIndex]

    onChange(snappedValue)
  }

  const handleLabelClick = (index: number) => {
    if (disabled || !onChange) return
    onChange(SLIDER_POSITIONS[index])
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Labels Container */}
      <div className="relative mb-2 overflow-hidden h-12">
        <div
          className="flex absolute w-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${labelOffset}%)`,
          }}
        >
          {SLIDER_LABELS.map((label, index) => (
            <div
              key={index}
              className={`flex-none text-3xl font-sans font-bold transition-colors duration-200 text-center whitespace-nowrap ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${index === activeIndex ? "text-black" : "text-gray-400"}`}
              style={{
                width: "25%",
              }}
              onClick={() => handleLabelClick(index)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Track */}
      <div className="relative">
        <div
          ref={sliderRef}
          className={`relative h-1.5 rounded-full ${disabled ? "cursor-default" : "cursor-pointer"}`}
          style={{
            background: "linear-gradient(to right, #E8F833, #FFA500, #FF5C38)",
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Handle/Thumb - Made longer */}
          <div
            className="absolute w-0.5 h-16 bg-[#FF5C38] transition-all duration-300 ease-out"
            style={{
              left: `${value}%`,
              transform: "translateX(-50%)",
              top: "-32px", // Adjusted to center the longer line
            }}
          />
        </div>
      </div>
    </div>
  )
}
