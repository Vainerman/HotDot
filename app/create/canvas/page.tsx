"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export default function CreateCanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [creatorName, setCreatorName] = useState("")
  const [isFinished, setIsFinished] = useState(false)
  const router = useRouter()
  const timeLeftRef = useRef(30)

  useEffect(() => {
    const name = localStorage.getItem("creatorName")
    if (name) {
      setCreatorName(name)
    }
  }, [])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  // Function to capture canvas with background
  const captureCanvasWithBackground = (canvas: HTMLCanvasElement) => {
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return canvas.toDataURL()

    // Set same dimensions as original canvas
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height

    // Fill with background color
    tempCtx.fillStyle = "#f5f5f5"
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

    // Get the container dimensions for proper scaling
    const container = canvas.parentElement
    if (container) {
      const rect = container.getBoundingClientRect()
      const devicePixelRatio = window.devicePixelRatio || 1

      // Scale context to match the original canvas scaling
      tempCtx.scale(devicePixelRatio, devicePixelRatio)

      // Draw the two circles background directly
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      tempCtx.strokeStyle = "#000000"
      tempCtx.lineWidth = 4
      tempCtx.beginPath()
      tempCtx.arc(centerX - 64, centerY, 48, 0, Math.PI * 2)
      tempCtx.stroke()

      tempCtx.beginPath()
      tempCtx.arc(centerX + 64, centerY, 48, 0, Math.PI * 2)
      tempCtx.stroke()

      // Reset scale for drawing the canvas content
      tempCtx.setTransform(1, 0, 0, 1, 0, 0)
    }

    // Draw the original canvas content on top
    tempCtx.drawImage(canvas, 0, 0)

    return tempCanvas.toDataURL()
  }

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
      if (isFinished || timeLeftRef.current === 0) return
      isDrawingRef.current = true
      const pos = getEventPos(e)
      lastPointRef.current = pos

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current || !lastPointRef.current || isFinished || timeLeftRef.current === 0) return

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
  }, [isFinished])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isFinished])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const clearCanvas = () => {
    if (isFinished || timeLeftRef.current === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleFinish = () => {
    // Save the drawing with background to localStorage for later reference
    const canvas = canvasRef.current
    if (canvas) {
      const drawingData = captureCanvasWithBackground(canvas)
      localStorage.setItem("creatorDrawing", drawingData)
    }
    setIsFinished(true)
    router.push("/create/matching")
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#e8e8e8] px-4 py-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ff5c38] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{creatorName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <span className="text-black font-semibold">{creatorName}'s Challenge</span>
            <span className="text-gray-500 ml-2">• Round 01/03</span>
          </div>
        </div>
        <Link href="/">
          <X className="w-6 h-6 text-black" />
        </Link>
      </div>

      {/* Subtitle */}
      <div className="px-4 py-3 bg-[#e8e8e8] border-b border-gray-300">
        <p className="text-black text-lg">Create a drawing for others to guess</p>
      </div>

      {/* Main Drawing Area */}
      <div className="flex-1 relative bg-[#f5f5f5] flex items-center justify-center">
        {/* Two Circles Background - Back to CSS circles */}
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
            disabled={isFinished || timeLeft === 0}
            className="bg-white border-2 border-gray-300 text-gray-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Clear
          </button>
        </div>

        {/* Finish Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleFinish}
            disabled={isFinished}
            className="bg-[#ff5c38] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#e54d2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isFinished ? "Finished" : "Finish"}
          </button>
        </div>

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 ${isFinished || timeLeft === 0 ? "cursor-default" : "cursor-crosshair"}`}
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Bottom Timer Section - No Slider */}
      <div className="bg-[#e8e8e8] px-4 py-6 border-t border-gray-300">
        <div className="text-center">
          <h2 className="text-black text-4xl font-bold mb-2">
            {isFinished ? "FINISHED" : timeLeft === 0 ? "TIME'S UP!" : `CREATE ${formatTime(timeLeft)}`}
          </h2>
        </div>
        {/* Orange accent bar */}
        <div className="mt-4">
          <div
            className="h-2 bg-[#ff5c38] rounded-full"
            style={{ width: isFinished ? "100%" : `${(timeLeft / 30) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
