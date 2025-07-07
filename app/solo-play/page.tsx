"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";

export default function SoloPlayPage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);

  useEffect(() => {
    console.log("Fetching templates...");
    fetch('/api/templates', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        console.log("Templates fetched:", data);
        if (data.files && data.files.length > 0) {
          const templates = data.files;
          console.log("Templates available:", templates);
          if (canvasRef.current) {
            const randomIndex = Math.floor(Math.random() * templates.length);
            const randomSvg = templates[randomIndex];
            const svgPath = `/assets/templates/${randomSvg}`;
            console.log("Drawing template:", svgPath);
            canvasRef.current.drawSvg(svgPath);
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
          className="shadow-lg"
          style={{ 
            width: '346px',
            height: '562px',
            backgroundImage: "url('/assets/Card_1.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center' 
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
