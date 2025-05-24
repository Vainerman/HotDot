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

    // Generate smooth, natural curves for freehand drawing
    const generateSmoothCurve = (startX: number, startY: number, endX: number, endY: number, curviness = 0.3) => {
      const points = []
      const steps = 30

      for (let i = 0; i <= steps; i++) {
        const t = i / steps

        // Add natural hand tremor
        const tremor = (Math.sin(t * 20) + Math.cos(t * 15)) * 2

        // Bezier curve with natural variation
        const x = startX + (endX - startX) * t + Math.sin(t * Math.PI * 2) * curviness * 20 + tremor
        const y = startY + (endY - startY) * t + Math.cos(t * Math.PI * 3) * curviness * 15 + tremor

        points.push({ x, y })
      }
      return points
    }

    const generateCircle = (centerX: number, centerY: number, radius: number, irregularity = 0.1) => {
      const points = []
      const steps = 40

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2
        const radiusVariation = radius + Math.sin(angle * 5) * irregularity * radius
        const tremor = (Math.sin(angle * 10) + Math.cos(angle * 7)) * 1.5

        const x = centerX + Math.cos(angle) * radiusVariation + tremor
        const y = centerY + Math.sin(angle) * radiusVariation + tremor

        points.push({ x, y })
      }
      return points
    }

    // Smooth drawing simulation with natural hand movement
    const drawSmoothPath = (points: { x: number; y: number }[], duration: number, callback?: () => void) => {
      let currentIndex = 0
      const totalPoints = points.length
      const baseInterval = duration / totalPoints

      const drawNextPoint = () => {
        if (currentIndex < totalPoints) {
          const point = points[currentIndex]

          // Vary drawing speed naturally
          const speedVariation = 0.5 + Math.random() * 1
          const interval = baseInterval * speedVariation

          if (currentIndex === 0) {
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
          } else {
            // Use quadratic curves for smoother lines
            const prevPoint = points[currentIndex - 1]
            const midX = (prevPoint.x + point.x) / 2
            const midY = (prevPoint.y + point.y) / 2

            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
            ctx.stroke()
          }

          currentIndex++
          setTimeout(drawNextPoint, interval)
        } else {
          ctx.stroke()
          if (callback) callback()
        }
      }

      drawNextPoint()
    }

    const simulateCarDrawing = () => {
      // Car body - smooth freehand rectangle
      const carBody = [
        ...generateSmoothCurve(centerX - 80, centerY + 20, centerX - 75, centerY - 15, 0.2),
        ...generateSmoothCurve(centerX - 75, centerY - 15, centerX + 85, centerY - 12, 0.1),
        ...generateSmoothCurve(centerX + 85, centerY - 12, centerX + 82, centerY + 22, 0.2),
        ...generateSmoothCurve(centerX + 82, centerY + 22, centerX - 80, centerY + 20, 0.1),
      ]

      // Car roof - smooth trapezoid
      const roof = [
        ...generateSmoothCurve(centerX - 45, centerY - 15, centerX - 38, centerY - 45, 0.15),
        ...generateSmoothCurve(centerX - 38, centerY - 45, centerX + 42, centerY - 43, 0.1),
        ...generateSmoothCurve(centerX + 42, centerY - 43, centerX + 48, centerY - 12, 0.15),
      ]

      // Wheels - natural circles
      const leftWheel = generateCircle(centerX - 50, centerY + 35, 18, 0.15)
      const rightWheel = generateCircle(centerX + 45, centerY + 37, 16, 0.12)

      // Windows - smooth rectangles
      const leftWindow = [
        ...generateSmoothCurve(centerX - 35, centerY - 12, centerX - 32, centerY - 38, 0.1),
        ...generateSmoothCurve(centerX - 32, centerY - 38, centerX - 5, centerY - 36, 0.05),
        ...generateSmoothCurve(centerX - 5, centerY - 36, centerX - 8, centerY - 14, 0.1),
        ...generateSmoothCurve(centerX - 8, centerY - 14, centerX - 35, centerY - 12, 0.05),
      ]

      const rightWindow = [
        ...generateSmoothCurve(centerX + 8, centerY - 14, centerX + 12, centerY - 37, 0.1),
        ...generateSmoothCurve(centerX + 12, centerY - 37, centerX + 38, centerY - 35, 0.05),
        ...generateSmoothCurve(centerX + 38, centerY - 35, centerX + 42, centerY - 12, 0.1),
        ...generateSmoothCurve(centerX + 42, centerY - 12, centerX + 8, centerY - 14, 0.05),
      ]

      // Headlights - small natural circles
      const leftHeadlight = generateCircle(centerX - 78, centerY - 2, 8, 0.2)
      const rightHeadlight = generateCircle(centerX + 80, centerY + 1, 7, 0.18)

      // Execute smooth drawing sequence
      setTimeout(() => {
        setIsDrawing(true)
        drawSmoothPath(carBody, 4000, () => {
          setIsDrawing(false)
          setTimeout(() => {
            setIsDrawing(true)
            drawSmoothPath(roof, 2500, () => {
              setIsDrawing(false)
              setTimeout(() => {
                setIsDrawing(true)
                drawSmoothPath(leftWheel, 2000, () => {
                  setIsDrawing(false)
                  setTimeout(() => {
                    setIsDrawing(true)
                    drawSmoothPath(rightWheel, 1800, () => {
                      setIsDrawing(false)
                      setTimeout(() => {
                        setIsDrawing(true)
                        drawSmoothPath(leftWindow, 1500, () => {
                          setIsDrawing(false)
                          setTimeout(() => {
                            setIsDrawing(true)
                            drawSmoothPath(rightWindow, 1400, () => {
                              setIsDrawing(false)
                              setTimeout(() => {
                                setIsDrawing(true)
                                drawSmoothPath(leftHeadlight, 800, () => {
                                  setIsDrawing(false)
                                  setTimeout(() => {
                                    setIsDrawing(true)
                                    drawSmoothPath(rightHeadlight, 700, () => {
                                      setIsDrawing(false)
                                    })
                                  }, 600)
                                })
                              }, 500)
                            })
                          }, 400)
                        })
                      }, 800)
                    })
                  }, 700)
                })
              }, 900)
            })
          }, 1200)
        })
      }, 2000)
    }

    simulateCarDrawing()
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
