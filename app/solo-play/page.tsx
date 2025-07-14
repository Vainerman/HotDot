"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";
import SaveChallengeModal from "@/components/ui/save-challenge-modal";

export default function SoloPlayPage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const data = canvasRef.current.getSvg();
      setDrawingData(data);
    }
    setIsFinished(true);
  };

  const handleNope = () => {
    setIsFinished(false);
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setHeaderKey((prevKey) => prevKey + 1);
  };

  const handlePlayAgain = () => {
    setIsFinished(false);
    setIsModalOpen(false);
    if (canvasRef.current) {
      canvasRef.current.clear();
      fetchNewTemplate();
    }
    setHeaderKey((prevKey) => prevKey + 1);
  };

  const handleKeep = () => {
    setIsModalOpen(true);
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
          <DrawableCanvas ref={canvasRef} isLocked={isFinished} />
        </div>
      </main>
      <footer className="flex items-center justify-between p-4 border-t border-gray-300">
        {!isFinished ? (
          <>
            <div className="flex items-center gap-4">
              <Button variant="outline">Undo</Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
            <Button onClick={handleDone}>Done</Button>
          </>
        ) : (
          <div className="flex w-full justify-around">
            <Button variant="destructive" onClick={handleNope}>
              NOPE
            </Button>
            <Button onClick={handleKeep}>KEEP</Button>
          </div>
        )}
      </footer>
      <SaveChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlayAgain={handlePlayAgain}
        drawingData={drawingData}
      />
    </div>
  );
}
