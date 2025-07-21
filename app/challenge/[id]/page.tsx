"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader, { ChallengeHeaderRef } from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ChallengePage({ params }: { params: { id: string } }) {
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const headerRef = useRef<ChallengeHeaderRef>(null);
  const [gameState, setGameState] = useState<"drawing" | "finished" | "saved">("drawing");
  const [drawingData, setDrawingData] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/challenge/${params.id}`).then(res => res.json()).then(data => {
      if (data.template_svg && canvasRef.current) {
        canvasRef.current.animateSvg(data.template_svg, data.template_viewbox);
      }
    });
  }, [params.id]);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleDone = () => {
    if (headerRef.current) {
      headerRef.current.stopTimer();
    }
    if (canvasRef.current) {
      const data = canvasRef.current.getDrawingAsSvg();
      setDrawingData(data);
    }
    setGameState("finished");
  };

  const handlePlayAgain = () => {
    setGameState("drawing");
    if (canvasRef.current) {
      canvasRef.current.clear(false);
      // redraw original template automatically
      fetch(`/api/challenge/${params.id}`).then(res => res.json()).then(data => {
        if (canvasRef.current) {
          canvasRef.current.animateSvg(data.template_svg, data.template_viewbox);
        }
      });
    }
  };

  const renderFooterButtons = () => {
    switch (gameState) {
      case "finished":
        return (
          <div className="flex w-full justify-around">
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
    <div className="relative flex flex-col h-screen-dynamic">
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Image src="/assets/home.png" alt="Home" width={40} height={40} />
      </Link>
      <main className="flex-grow flex flex-col items-center justify-center gap-4 py-4">
        <AnimatedChallengeHeader
          ref={headerRef}
          onCountdownStart={() => {}}
          onCountdownFinish={handleDone}
        />
        <div
          className="relative w-full max-w-sm mx-auto"
          style={{
            aspectRatio: '346 / 562',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/Card_1.svg')" }}
          ></div>
          <div className="absolute inset-0">
            <DrawableCanvas ref={canvasRef} isLocked={gameState !== "drawing"} />
          </div>
        </div>
      </main>
      <footer className="flex items-center justify-between p-4 border-t border-gray-300">
        {renderFooterButtons()}
      </footer>
    </div>
  );
}
