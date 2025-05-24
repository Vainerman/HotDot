"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import HotColdSlider from "../../components/hot-cold-slider"

export default function GuessPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const timeLeftRef = useRef(30)
  const [hotColdValue, setHotColdValue] = useState(50)
  const [isCanvasLocked, setIsCanvasLocked] = useState(false)

  // Simulate hot-cold slider movement
  useEffect(() => {
    const simulateSliderMovement = () => {
      const movements = [
        { value: 30, delay: 3000 }, // Start cold
        { value: 45, delay: 5000 }, // Getting warmer
        { value: 65, delay: 8000 }, // Warm
        { value: 80, delay: 12000 }, // Hot
        { value: 60, delay: 15000 }, // Back to warm
        { value: 75, delay: 18000 }, // Hot again
      ]

      movements.forEach(({ value, delay }) => {
        setTimeout(() => {
          setHotColdValue(value)
        }, delay)
      })
    }

    simulateSliderMovement()
  }, [])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the container element (the drawing area)
    const container = canvas.parentElement
    if (!container) return

    // Get device pixel ratio for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1

    // Use the full container size
    const rect = container.getBoundingClientRect()

    // Set the actual canvas size in memory (scaled up for high DPI)
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio

    // Scale the canvas back down using CSS to fill the container
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    // Scale the drawing context so everything draws at the correct size
    ctx.scale(devicePixelRatio, devicePixelRatio)

    // Set drawing properties for high-quality rendering
    ctx.strokeStyle = "#ff5c38" // Orange color
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.globalCompositeOperation = "source-over"
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const getEventPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()

      if ("touches" in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        }
      } else {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      if (isCanvasLocked || timeLeftRef.current === 0) return
      isDrawingRef.current = true
      const pos = getEventPos(e)
      lastPointRef.current = pos

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current || !lastPointRef.current || isCanvasLocked || timeLeftRef.current === 0) return

      const currentPos = getEventPos(e)
      const lastPos = lastPointRef.current

      // Use quadratic curves for smoother lines
      const midX = (lastPos.x + currentPos.x) / 2
      const midY = (lastPos.y + currentPos.y) / 2

      ctx.quadraticCurveTo(lastPos.x, lastPos.y, midX, midY)
      ctx.stroke()

      lastPointRef.current = currentPos
    }

    const stopDrawing = () => {
      if (isDrawingRef.current) {
        ctx.stroke()
        ctx.beginPath()
      }
      isDrawingRef.current = false
      lastPointRef.current = null
    }

    const handleResize = () => {
      const container = canvas.parentElement
      if (!container) return

      const newRect = container.getBoundingClientRect()
      const newDevicePixelRatio = window.devicePixelRatio || 1

      // Save current drawing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Resize canvas to fill container
      canvas.width = newRect.width * newDevicePixelRatio
      canvas.height = newRect.height * newDevicePixelRatio
      canvas.style.width = "100%"
      canvas.style.height = "100%"

      // Restore context settings
      ctx.scale(newDevicePixelRatio, newDevicePixelRatio)
      ctx.strokeStyle = "#ff5c38"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.globalCompositeOperation = "source-over"
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Restore drawing (scaled appropriately)
      ctx.putImageData(imageData, 0, 0)
    }

    // Mouse events
    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseout", stopDrawing)

    // Touch events for mobile with better handling
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault()
        startDrawing(e)
      },
      { passive: false },
    )

    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault()
        draw(e)
      },
      { passive: false },
    )

    canvas.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault()
        stopDrawing()
      },
      { passive: false },
    )

    window.addEventListener("resize", handleResize)

    return () => {
      canvas.removeEventListener("mousedown", startDrawing)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseout", stopDrawing)
      canvas.removeEventListener("touchstart", startDrawing)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", stopDrawing)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Lock canvas when time ends
      setIsCanvasLocked(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const clearCanvas = () => {
    if (isCanvasLocked) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#e8e8e8] px-4 py-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">Y</span>
          </div>
          <div>
            <span className="text-black font-semibold">Yarden's Challenge</span>
            <span className="text-gray-500 ml-2">• Round 01/03</span>
          </div>
        </div>
        <Link href="/">
          <X className="w-6 h-6 text-black" />
        </Link>
      </div>

      {/* Subtitle */}
      <div className="px-4 py-3 bg-[#e8e8e8] border-b border-gray-300">
        <p className="text-black text-lg">Turn this shape into your best guess</p>
      </div>

      {/* Main Drawing Area */}
      <div className="flex-1 relative bg-[#f5f5f5] flex items-center justify-center">
        {/* Two Circles Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-8">
            <div className="w-24 h-24 border-4 border-black rounded-full"></div>
            <div className="w-24 h-24 border-4 border-black rounded-full"></div>
          </div>
        </div>

        {/* Clear Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={clearCanvas}
            disabled={isCanvasLocked}
            className="bg-white border-2 border-gray-300 text-gray-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Clear
          </button>
        </div>

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 ${isCanvasLocked || timeLeft === 0 ? "cursor-default" : "cursor-crosshair"}`}
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Bottom Hot-Cold Feedback Section */}
      <div className="bg-[#e8e8e8] px-4 py-6 border-t border-gray-300">
        <div className="text-center mb-4">
          <h2 className="text-black text-2xl font-bold mb-2">GUESS {formatTime(timeLeft)}</h2>
        </div>
        <HotColdSlider value={hotColdValue} disabled={true} />
      </div>
    </div>
  )
}
