"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader, { ChallengeHeaderRef } from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { saveDrawing } from "@/app/actions";

export default function ChallengePage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const headerRef = useRef<ChallengeHeaderRef>(null);
  const [gameState, setGameState] = useState<"drawing" | "finished" | "saved">("drawing");
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [headerKey, setHeaderKey] = useState(0);
  const [template, setTemplate] = useState<{ svgContent: string; viewBox: string } | null>(null);
  const router = useRouter();
  const { id: challengeId } = useParams();

  const fetchChallengeTemplate = () => {
    if (!challengeId) return;
    console.log("Fetching challenge template data...");
    fetch(`/api/challenge/${challengeId}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch challenge template');
        }
        return res.json();
      })
      .then(data => {
        console.log("Challenge template data fetched:", data);
        if (data.template_svg) {
          console.log("SVG content available. Animating on canvas...");
          if (canvasRef.current) {
            canvasRef.current.animateSvg(data.template_svg, data.template_viewbox);
          }
          setTemplate({ svgContent: data.template_svg, viewBox: data.template_viewbox });
        }
      })
      .catch(error => {
        console.error("Error fetching challenge template:", error);
        // Optionally handle the error, e.g., show a message to the user
      });
  };

  useEffect(() => {
    if (challengeId) {
      fetchChallengeTemplate();
    }
  }, [challengeId]);

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
      fetchChallengeTemplate();
    }
    setHeaderKey((prevKey: number) => prevKey + 1);
  };
  
  const handleKeep = () => {
    console.log("handleKeep called. Current drawing data:", drawingData ? "Exists" : "Empty");
    setGameState("saved");
    if (drawingData) {
      saveDrawing(drawingData).then(result => {
        console.log("Background save response:", result);
        if (result?.error) {
          console.error("Background save failed:", result.error);
        }
      });
    }
  };

  const renderFooterButtons = () => {
    switch (gameState) {
      case "finished":
        return (
          <div className="flex w-full justify-around">
             <Button
               onClick={handlePlayAgain}
               variant="secondaryCta"
               className="px-8 py-4 text-lg font-sans flex items-center gap-2"
             >
               <Image
                 src="/assets/NopeX.svg"
                 width={20}
                 height={20}
                 alt="Play Again icon"
               />
               <span>TRY AGAIN</span>
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
            <Button asChild variant="primaryCta" className="font-sans">
              <Link href="/solo-play">PLAY A NEW GAME</Link>
            </Button>
            <Button variant="secondary" onClick={handlePlayAgain} className="font-sans">
              REPLAY CHALLENGE
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
            <Button onClick={handleDone} variant="primaryCta" className="font-sans">Done</Button>
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
          key={headerKey}
          todaysDrawings={0}
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
