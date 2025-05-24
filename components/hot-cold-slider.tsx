"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface HotColdSliderProps {
  value: number // 0-100
  onChange?: (value: number) => void
  disabled?: boolean
}

const SLIDER_POSITIONS = [0, 35, 50, 65, 100]
const SLIDER_LABELS = ["VERY COLD", "COLD", "WARM", "HOT", "VERY HOT"]

export default function HotColdSlider({ value, onChange, disabled = false }: HotColdSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(value)
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
  const currentValue = isDragging ? dragValue : value
  const activeIndex = getClosestPositionIndex(currentValue)

  // Calculate the offset to center the active label on the handle
  const calculateLabelOffset = () => {
    // Use wider spacing to prevent overlap
    const labelPositions = [0, 30, 50, 70, 100] // Wider spacing for labels
    const targetCenter = 50
    const activeLabelPosition = labelPositions[activeIndex]
    return targetCenter - activeLabelPosition
  }

  const labelOffset = calculateLabelOffset()

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    const percentage = getPercentageFromEvent(e.clientX)
    setDragValue(percentage)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return
    const percentage = getPercentageFromEvent(e.clientX)
    setDragValue(percentage)
  }

  const handleMouseUp = () => {
    if (!isDragging || disabled || !onChange) return

    // Snap to closest position when releasing
    const closestIndex = getClosestPositionIndex(dragValue)
    const snappedValue = SLIDER_POSITIONS[closestIndex]

    onChange(snappedValue)
    setIsDragging(false)
  }

  const getPercentageFromEvent = (clientX: number) => {
    if (!sliderRef.current) return 0

    const rect = sliderRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  const getPercentageFromTouch = (touch: Touch) => {
    if (!sliderRef.current) return 0

    const rect = sliderRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
  }

  const handleLabelClick = (index: number) => {
    if (disabled || !onChange) return
    onChange(SLIDER_POSITIONS[index])
  }

  // Handle thumb/pin interactions with larger hitbox
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent track click
    if (disabled) return
    setIsDragging(true)
    const percentage = getPercentageFromEvent(e.clientX)
    setDragValue(percentage)
  }

  // Touch event handlers for the thumb - optimized for iPad
  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation() // Prevent track touch
    e.preventDefault() // Prevent scrolling
    if (disabled) return

    // Immediate response for touch
    setIsDragging(true)
    const percentage = getPercentageFromTouch(e.touches[0])
    setDragValue(percentage)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || disabled) return
    e.preventDefault() // Prevent scrolling
    const percentage = getPercentageFromTouch(e.touches[0])
    setDragValue(percentage)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDragging || disabled || !onChange) return
    e.preventDefault()

    // Snap to closest position when releasing
    const closestIndex = getClosestPositionIndex(dragValue)
    const snappedValue = SLIDER_POSITIONS[closestIndex]

    onChange(snappedValue)
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      // Touch events with immediate response
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging, dragValue])

  // Update dragValue when value prop changes (for external updates)
  useEffect(() => {
    if (!isDragging) {
      setDragValue(value)
    }
  }, [value, isDragging])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Labels Container */}
      <div className="relative mb-2 overflow-hidden h-12">
        <div
          className="flex absolute transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${labelOffset}%)`,
            width: "200%", // Make container wider to accommodate spacing
            left: "-50%", // Center the wider container
          }}
        >
          {SLIDER_LABELS.map((label, index) => (
            <div
              key={index}
              className={`flex-none text-3xl font-sans font-bold transition-colors duration-200 text-center whitespace-nowrap ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${index === activeIndex ? "text-black" : "text-gray-400"}`}
              style={{
                width: "20%", // Smaller percentage of the wider container
                padding: "0 10px", // Add padding to prevent overlap
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
          {/* Handle/Thumb with much larger hitbox for iPad */}
          <div
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `${currentValue}%`,
              transform: "translateX(-50%)",
              top: "-40px",
            }}
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbTouchStart}
          >
            {/* Extra large invisible hitbox for iPad - 80px wide, 80px tall */}
            <div
              className="absolute -left-10 -top-6 w-20 h-20 cursor-pointer"
              style={{
                background: "transparent",
                touchAction: "none", // Prevent any touch delays
              }}
            />
            {/* Visible thumb */}
            <div className="w-0.5 h-16 bg-[#FF5C38] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
