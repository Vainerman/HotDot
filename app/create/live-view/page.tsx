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
  const [showResults, setShowResults] = useState(false)
  const [guesserDrawing, setGuesserDrawing] = useState<string>("")
  const [creatorDrawing, setCreatorDrawing] = useState<string>("")
  const [drawingComplete, setDrawingComplete] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem("creatorName")
    if (name) {
      setCreatorName(name)
    }

    // Get creator's drawing
    const creatorDrawingData = localStorage.getItem("creatorDrawing")
    if (creatorDrawingData) {
      setCreatorDrawing(creatorDrawingData)
    }
  }, [])

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

    // Generate smoother, less wiggly curves for cleaner drawing
    const generateSmoothCurve = (startX: number, startY: number, endX: number, endY: number, curviness = 0.1) => {
      const points = []
      const steps = 25

      for (let i = 0; i <= steps; i++) {
        const t = i / steps

        // Reduced tremor for cleaner lines
        const tremor = (Math.sin(t * 12) + Math.cos(t * 8)) * 0.8

        // Less curvy bezier curve
        const x = startX + (endX - startX) * t + Math.sin(t * Math.PI * 1.5) * curviness * 12 + tremor
        const y = startY + (endY - startY) * t + Math.cos(t * Math.PI * 2) * curviness * 8 + tremor

        points.push({ x, y })
      }
      return points
    }

    const generateCircle = (centerX: number, centerY: number, radius: number, irregularity = 0.05) => {
      const points = []
      const steps = 35

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2
        const radiusVariation = radius + Math.sin(angle * 4) * irregularity * radius
        const tremor = (Math.sin(angle * 8) + Math.cos(angle * 6)) * 0.8

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

          // Less speed variation for smoother drawing
          const speedVariation = 0.7 + Math.random() * 0.6
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
      // Car body - proportioned to the connected circles
      const carBody = [
        ...generateSmoothCurve(centerX - 90, centerY + 15, centerX - 85, centerY - 20, 0.08),
        ...generateSmoothCurve(centerX - 85, centerY - 20, centerX + 95, centerY - 18, 0.05),
        ...generateSmoothCurve(centerX + 95, centerY - 18, centerX + 90, centerY + 17, 0.08),
        ...generateSmoothCurve(centerX + 90, centerY + 17, centerX - 90, centerY + 15, 0.05),
      ]

      // Car roof - cleaner trapezoid
      const roof = [
        ...generateSmoothCurve(centerX - 50, centerY - 20, centerX - 45, centerY - 50, 0.06),
        ...generateSmoothCurve(centerX - 45, centerY - 50, centerX + 50, centerY - 48, 0.04),
        ...generateSmoothCurve(centerX + 50, centerY - 48, centerX + 55, centerY - 18, 0.06),
      ]

      // Wheels - positioned to align with the black circles (48px radius each)
      // Left wheel at centerX - 40, right wheel at centerX + 40
      const leftWheel = generateCircle(centerX - 40, centerY + 35, 22, 0.08)
      const rightWheel = generateCircle(centerX + 40, centerY + 35, 22, 0.08)

      // Windows - cleaner rectangles
      const leftWindow = [
        ...generateSmoothCurve(centerX - 40, centerY - 18, centerX - 38, centerY - 42, 0.04),
        ...generateSmoothCurve(centerX - 38, centerY - 42, centerX - 8, centerY - 40, 0.02),
        ...generateSmoothCurve(centerX - 8, centerY - 40, centerX - 10, centerY - 20, 0.04),
        ...generateSmoothCurve(centerX - 10, centerY - 20, centerX - 40, centerY - 18, 0.02),
      ]

      const rightWindow = [
        ...generateSmoothCurve(centerX + 10, centerY - 20, centerX + 12, centerY - 41, 0.04),
        ...generateSmoothCurve(centerX + 12, centerY - 41, centerX + 42, centerY - 39, 0.02),
        ...generateSmoothCurve(centerX + 42, centerY - 39, centerX + 48, centerY - 18, 0.04),
        ...generateSmoothCurve(centerX + 48, centerY - 18, centerX + 10, centerY - 20, 0.02),
      ]

      // Headlights - small clean circles
      const leftHeadlight = generateCircle(centerX - 88, centerY - 5, 6, 0.1)
      const rightHeadlight = generateCircle(centerX + 92, centerY - 3, 6, 0.1)

      // Execute smooth drawing sequence with better timing
      setTimeout(() => {
        setIsDrawing(true)
        drawSmoothPath(carBody, 3500, () => {
          setIsDrawing(false)
          setTimeout(() => {
            setIsDrawing(true)
            drawSmoothPath(roof, 2200, () => {
              setIsDrawing(false)
              setTimeout(() => {
                setIsDrawing(true)
                drawSmoothPath(leftWheel, 1800, () => {
                  setIsDrawing(false)
                  setTimeout(() => {
                    setIsDrawing(true)
                    drawSmoothPath(rightWheel, 1600, () => {
                      setIsDrawing(false)
                      setTimeout(() => {
                        setIsDrawing(true)
                        drawSmoothPath(leftWindow, 1300, () => {
                          setIsDrawing(false)
                          setTimeout(() => {
                            setIsDrawing(true)
                            drawSmoothPath(rightWindow, 1200, () => {
                              setIsDrawing(false)
                              setTimeout(() => {
                                setIsDrawing(true)
                                drawSmoothPath(leftHeadlight, 700, () => {
                                  setIsDrawing(false)
                                  setTimeout(() => {
                                    setIsDrawing(true)
                                    drawSmoothPath(rightHeadlight, 600, () => {
                                      setIsDrawing(false)
                                      // Save the simulated guesser drawing with background
                                      const simulatedDrawing = captureCanvasWithBackground(canvas)
                                      setGuesserDrawing(simulatedDrawing)
                                      setDrawingComplete(true)
                                    })
                                  }, 500)
                                })
                              }, 400)
                            })
                          }, 300)
                        })
                      }, 600)
                    })
                  }, 500)
                })
              }, 700)
            })
          }, 1000)
        })
      }, 2000)
    }

    if (!showResults && !drawingComplete) {
      simulateCarDrawing()
    }
  }, [showResults, drawingComplete])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Show results when time ends, but only if drawing is complete
      if (drawingComplete) {
        setTimeout(() => {
          setShowResults(true)
        }, 1000)
      } else {
        // If drawing isn't complete yet, wait for it
        const checkDrawingComplete = setInterval(() => {
          if (drawingComplete) {
            clearInterval(checkDrawingComplete)
            setTimeout(() => {
              setShowResults(true)
            }, 1000)
          }
        }, 100)
      }
    }
  }, [timeLeft, drawingComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        {/* Header */}
        <div className="bg-[#e8e8e8] px-4 py-4 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ff5c38] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{creatorName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-black font-semibold">Results</span>
              <span className="text-gray-500 ml-2">• Round 01/03</span>
            </div>
          </div>
          <Link href="/">
            <X className="w-6 h-6 text-black" />
          </Link>
        </div>

        {/* Results Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Guesser's Drawing */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-4">{guesserName}'s Guess</h2>
            <div className="relative bg-[#f5f5f5] rounded-lg" style={{ aspectRatio: "4/3" }}>
              {guesserDrawing && (
                <img
                  src={guesserDrawing || "/placeholder.svg"}
                  alt="Guesser's drawing"
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Your Original Drawing */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-4">Your Original Drawing</h2>
            <div className="relative bg-[#f5f5f5] rounded-lg" style={{ aspectRatio: "4/3" }}>
              {creatorDrawing && (
                <img
                  src={creatorDrawing || "/placeholder.svg"}
                  alt="Original drawing"
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-[#ff5c38] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-[#e54d2e] transition-colors">
              Next Round
            </button>
            <Link href="/" className="flex-1">
              <button className="w-full bg-gray-200 text-black py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors">
                Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
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
        {/* Two Circles Background - Back to CSS circles */}
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

      {/* Bottom Section with Timer and Hot-Cold Slider */}
      <div className="bg-[#e8e8e8] px-4 py-6 border-t border-gray-300">
        <div className="text-center mb-4">
          <h2 className="text-black text-2xl font-bold mb-2">
            {timeLeft === 0 ? "TIME'S UP!" : `WATCH ${formatTime(timeLeft)}`}
          </h2>
          <p className="text-gray-600">Give {guesserName} a hint</p>
        </div>
        <HotColdSlider value={hotColdValue} onChange={setHotColdValue} />
      </div>
    </div>
  )
}
