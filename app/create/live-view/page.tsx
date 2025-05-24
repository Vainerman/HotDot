"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X, Eye } from "lucide-react"
import HotColdSlider from "../../../components/hot-cold-slider"

export default function LiveViewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [creatorName, setCreatorName] = useState("")
  const [guesserName] = useState("Alex")
  const [timeLeft, setTimeLeft] = useState(30)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hotColdValue, setHotColdValue] = useState(50)

  useEffect(() => {
    const name = localStorage.getItem("creatorName")
    if (name) {
      setCreatorName(name)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = canvas.parentElement
    if (!container) return

    const devicePixelRatio = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()

    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.strokeStyle = "#ff5c38"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.globalCompositeOperation = "source-over"
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Smooth drawing simulation
    const drawPath = (points: { x: number; y: number }[], duration: number, callback?: () => void) => {
      let currentIndex = 0
      const totalPoints = points.length
      const interval = duration / totalPoints

      const drawNextPoint = () => {
        if (currentIndex < totalPoints) {
          const point = points[currentIndex]

          if (currentIndex === 0) {
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
            ctx.stroke()
          }

          currentIndex++
          setTimeout(drawNextPoint, interval)
        } else {
          if (callback) callback()
        }
      }

      drawNextPoint()
    }

    const simulateDrawing = () => {
      // Generate smooth circle path for left circle
      const leftCirclePoints = []
      for (let i = 0; i <= 60; i++) {
        const angle = (i / 60) * Math.PI * 2
        leftCirclePoints.push({
          x: centerX - 64 + Math.cos(angle) * 40,
          y: centerY + Math.sin(angle) * 40,
        })
      }

      // Generate smooth circle path for right circle
      const rightCirclePoints = []
      for (let i = 0; i <= 60; i++) {
        const angle = (i / 60) * Math.PI * 2
        rightCirclePoints.push({
          x: centerX + 64 + Math.cos(angle) * 40,
          y: centerY + Math.sin(angle) * 40,
        })
      }

      // Generate connecting line
      const connectPoints = []
      for (let i = 0; i <= 20; i++) {
        connectPoints.push({
          x: centerX - 24 + (i / 20) * 48,
          y: centerY,
        })
      }

      // Generate vertical line
      const verticalPoints = []
      for (let i = 0; i <= 30; i++) {
        verticalPoints.push({
          x: centerX,
          y: centerY - 60 + (i / 30) * 120,
        })
      }

      // Execute drawing sequence
      setTimeout(() => {
        setIsDrawing(true)
        drawPath(leftCirclePoints, 2000, () => {
          setIsDrawing(false)
          setTimeout(() => {
            setIsDrawing(true)
            drawPath(rightCirclePoints, 2000, () => {
              setIsDrawing(false)
              setTimeout(() => {
                setIsDrawing(true)
                drawPath(connectPoints, 1000, () => {
                  setIsDrawing(false)
                  setTimeout(() => {
                    setIsDrawing(true)
                    drawPath(verticalPoints, 1500, () => {
                      setIsDrawing(false)
                    })
                  }, 1000)
                })
              }, 1000)
            })
          }, 1500)
        })
      }, 2000)
    }

    simulateDrawing()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#e8e8e8] px-4 py-4 flex items-center justify-between border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">{guesserName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <span className="text-black font-semibold">{guesserName} is guessing</span>
            <span className="text-gray-500 ml-2">• Round 01/03</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Live</span>
            {isDrawing && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
          </div>
          <Link href="/">
            <X className="w-6 h-6 text-black" />
          </Link>
        </div>
      </div>

      {/* Subtitle */}
      <div className="px-4 py-3 bg-[#e8e8e8] border-b border-gray-300">
        <p className="text-black text-lg">Watch {guesserName} guess your drawing</p>
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

        {/* Live indicator */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>

        {/* Drawing Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: "none" }} />
      </div>

      {/* Bottom Hot-Cold Slider Section */}
      <div className="bg-[#e8e8e8] px-4 py-6 border-t border-gray-300">
        <div className="text-center mb-4">
          <h2 className="text-black text-2xl font-bold mb-2">Give {guesserName} a hint</h2>
          <p className="text-gray-600">Move the slider to show how close they are</p>
        </div>
        <HotColdSlider value={hotColdValue} onChange={setHotColdValue} />
      </div>
    </div>
  )
}
