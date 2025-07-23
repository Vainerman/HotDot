"use client";

import { Button } from "@/components/ui/button";
import DrawableCanvas, { DrawableCanvasRef } from "@/components/drawable-canvas";
import AnimatedChallengeHeader, { ChallengeHeaderRef } from "@/components/animated-challenge-header";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveDrawing, createMatchWithChallenge, getTodaysDrawingsCount } from "@/app/actions";

export default function SoloPlayPage() {
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const headerRef = useRef<ChallengeHeaderRef>(null);
  const [gameState, setGameState] = useState<"drawing" | "finished" | "saved">("drawing");
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [headerKey, setHeaderKey] = useState(0);
  const [template, setTemplate] = useState<{ svgContent: string; viewBox: string } | null>(null);
  const [isChallengeButtonDisabled, setIsChallengeButtonDisabled] = useState(false);
  const [todaysDrawings, setTodaysDrawings] = useState(0);
  const router = useRouter();

  const fetchNewTemplate = () => {
    console.log("Fetching SVG path data...");
    fetch('/api/templates', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.svgContent) {
          if (canvasRef.current) {
            canvasRef.current.animateSvg(data.svgContent, data.viewBox);
          }
          setTemplate({ svgContent: data.svgContent, viewBox: data.viewBox });
        }
      });
  };

  useEffect(() => {
    fetchNewTemplate();
    getTodaysDrawingsCount().then(setTodaysDrawings);
  }, []);

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
    setIsChallengeButtonDisabled(false);
  };

  const handleKeep = () => {
    console.log("handleKeep called. Current drawing data:", drawingData ? "Exists" : "Empty");
    // Immediately update the game state to continue the flow.
    setGameState("saved");
    if (drawingData) {
      // Call the server action to run in the background.
      // We are not `await`ing the result, so the UI won't block.
      saveDrawing(drawingData).then((result: { success?: boolean; error?: string; path?: string }) => {
        console.log("Background save response:", result);
        if (result?.error) {
          console.error("Background save failed:", result.error);
        }
      });
    }
  };

  const handleChallengeIt = async () => {
    if (!drawingData || !template) return;
    setIsChallengeButtonDisabled(true);

    const result = await createMatchWithChallenge(drawingData, template.svgContent, template.viewBox);
      
    if (result.success && result.matchId) {
      router.push(`/match/waiting/${result.matchId}`);
      } else {
      console.error(result.error || "Failed to create match and challenge");
      // Optionally, show an error to the user
      setIsChallengeButtonDisabled(false);
      }
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
              variant="primaryCta"
              className="font-sans"
              disabled={isChallengeButtonDisabled}
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
      <main className="flex-grow flex flex-col items-center justify-center gap-4 py-4 transform sm:scale-70 origin-top">
        <AnimatedChallengeHeader
          ref={headerRef}
          key={headerKey}
          todaysDrawings={todaysDrawings}
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
