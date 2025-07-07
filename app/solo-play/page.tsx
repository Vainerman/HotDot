"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";

export default function SoloPlayPage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);

  useEffect(() => {
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
  }, []);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <AnimatedChallengeHeader onCountdownStart={() => {}} />
        <div
          className=""
          style={{ 
            width: '346px',
            height: '562px',
            backgroundImage: "url('/assets/Card_1.svg')"
          }}
        >
          <DrawableCanvas ref={canvasRef} />
        </div>
      </main>
      <footer className="flex items-center justify-between p-4 border-t border-gray-300">
        <div className="flex items-center gap-4">
          <Button variant="outline">Undo</Button>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
        </div>
        <Button>Done</Button>
      </footer>
    </div>
  );
}
