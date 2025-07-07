"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";

export default function SoloPlayPage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [templates, setTemplates] = useState<string[]>([]);

  useEffect(() => {
    console.log("Fetching templates...");
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        console.log("Templates fetched:", data);
        if (data.files) {
          setTemplates(data.files);
        }
      });
  }, []);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleCountdownStart = () => {
    console.log("Countdown started. Templates available:", templates);
    if (canvasRef.current && templates.length > 0) {
      const randomIndex = Math.floor(Math.random() * templates.length);
      const randomSvg = templates[randomIndex];
      const svgPath = `/assets/templates/${randomSvg}`;
      console.log("Drawing template:", svgPath);
      canvasRef.current.drawSvg(svgPath);
    } else {
        console.log("Cannot draw template: no templates found or canvas not ready.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F1E9]">
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <AnimatedChallengeHeader onCountdownStart={handleCountdownStart} />
        <div
          className="rounded-lg shadow-lg"
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
