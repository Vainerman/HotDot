"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { saveDrawing } from "./actions";

export default function SoloPlayPage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [gameState, setGameState] = useState<"drawing" | "finished" | "saved">("drawing");
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [headerKey, setHeaderKey] = useState(0);

  const fetchNewTemplate = () => {
    console.log("Fetching SVG path data...");
    fetch('/api/templates', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        console.log("Path data fetched:", data);
        if (data.pathData) {
          console.log("Path data available. Animating on canvas...");
          if (canvasRef.current) {
            canvasRef.current.animateSvg(data.pathData, data.viewBox);
          }
        }
      });
  };

  useEffect(() => {
    fetchNewTemplate();
  }, []);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleDone = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.getDrawingAsSvg();
      setDrawingData(data);
    }
    setGameState("finished");
  };

  const handleNope = () => {
    setGameState("drawing");
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setHeaderKey((prevKey: number) => prevKey + 1);
  };

  const handlePlayAgain = () => {
    setGameState("drawing");
    if (canvasRef.current) {
      canvasRef.current.clear(false);
      fetchNewTemplate();
    }
    setHeaderKey((prevKey: number) => prevKey + 1);
  };

  const handleKeep = () => {
    console.log("handleKeep called. Current drawing data:", drawingData ? "Exists" : "Empty");
    // Immediately update the game state to continue the flow.
    setGameState("saved");
    if (drawingData) {
      // Call the server action to run in the background.
      // We are not `await`ing the result, so the UI won't block.
      saveDrawing(drawingData).then(result => {
        console.log("Background save response:", result);
        if (result?.error) {
          console.error("Background save failed:", result.error);
        }
      });
    }
  };

  const handleChallengeIt = () => {
    // We'll add logic to create a challenge later
    console.log("Challenge it!", drawingData);
  };

  const renderFooterButtons = () => {
    switch (gameState) {
      case "finished":
        return (
          <div className="flex w-full justify-around">
            <Button
              onClick={handleNope}
              className="px-8 py-4 text-lg font-sans bg-black text-white hover:bg-gray-800 flex items-center gap-2"
            >
              <Image
                src="/assets/NopeX.svg"
                width={20}
                height={20}
                alt="Nope icon"
              />
              <span>NOPE</span>
            </Button>
            <Button
              onClick={handleKeep}
              className="px-8 py-4 text-lg font-sans bg-[#FF6338] text-black hover:bg-[#C9330A] flex items-center gap-2"
            >
              <Image
                src="/assets/keepV.svg"
                width={20}
                height={20}
                alt="Keep icon"
              />
              <span>KEEP</span>
            </Button>
          </div>
        );
      case "saved":
        return (
          <div className="flex w-full justify-around">
            <Button
              onClick={handleChallengeIt}
              className="bg-[#FF6338] text-black hover:bg-[#FF5C38] font-sans"
            >
              CHALLENGE IT
            </Button>
            <Button variant="secondary" onClick={handlePlayAgain} className="font-sans">
              PLAY AGAIN
            </Button>
          </div>
        );
      case "drawing":
      default:
        return (
          <>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="font-sans">Undo</Button>
              <Button variant="outline" onClick={handleClear} className="font-sans">
                Clear
              </Button>
            </div>
            <Button onClick={handleDone} className="font-sans">Done</Button>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <AnimatedChallengeHeader
          key={headerKey}
          onCountdownStart={() => {}}
          onCountdownFinish={handleDone}
        />
        <div
          className=""
          style={{
            width: '346px',
            height: '562px',
            backgroundImage: "url('/assets/Card_1.svg')"
          }}
        >
          <DrawableCanvas ref={canvasRef} isLocked={gameState !== "drawing"} />
        </div>
      </main>
      <footer className="flex items-center justify-between p-4 border-t border-gray-300">
        {renderFooterButtons()}
      </footer>
    </div>
  );
}
