'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { createClient } from '@/utils/supabase/client';
import DrawableCanvas, { DrawableCanvasRef, DrawEvent } from '@/components/drawable-canvas';
import { Button } from '@/components/ui/button';
import Clock, { ClockRef } from '@/components/clock';
import AnimatedSvg from '@/components/animated-svg';
import HotColdSlider from '@/components/hot-cold-slider';
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMatchWithChallenge, saveDrawing } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RoundDrawing {
    id: number;
    round: number;
    drawing: string;
}

export default function LiveMatchPage() {
  const router = useRouter();
  const { id: matchId } = useParams();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const clockRef = useRef<ClockRef>(null);

  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [supabase] = useState(() => createClient());
  const [channel, setChannel] = useState<any>(null);
  const [matchState, setMatchState] = useState<'live' | 'between-rounds' | 'results'>('live');
  const matchStateRef = useRef(matchState);
  matchStateRef.current = matchState;

  const [creatorDrawing, setCreatorDrawing] = useState<{ svg: string; viewBox: string } | null>(null);
  const [guesserDrawing, setGuesserDrawing] = useState<string | null>(null); // This will hold the final drawing for the results
  const [sliderValue, setSliderValue] = useState(50);
  const [round, setRound] = useState(1);
  const [hints, setHints] = useState<string[]>([]);
  const [hintInput, setHintInput] = useState('');
  const [isHintInputVisible, setIsHintInputVisible] = useState(false);
  const [roundDrawings, setRoundDrawings] = useState<RoundDrawing[]>([]);
  const [cards, setCards] = useState<RoundDrawing[]>([]);
  const [isChallengeButtonDisabled, setIsChallengeButtonDisabled] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState<Set<number>>(new Set());
  const [opponentLeft, setOpponentLeft] = useState(false);
  const isMobile = useIsMobile();
  const hintInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobile && isHintInputVisible && hintInputRef.current) {
      hintInputRef.current.focus();
    }
  }, [isMobile, isHintInputVisible]);

  useEffect(() => {
    if (!matchId) return;

    const fetchChallengeData = async () => {
        const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('template_svg, template_viewbox, creator_drawing_svg')
        .eq('id', matchId)
        .single();
    
      if (matchError || !matchData) {
        console.error('Error fetching match data:', matchError);
        return;
      }
      
      if (canvasRef.current) {
        canvasRef.current.animateSvg(matchData.template_svg, matchData.template_viewbox);
      }

      setCreatorDrawing({ 
        svg: matchData.creator_drawing_svg || matchData.template_svg, 
        viewBox: matchData.template_viewbox 
      });
    };

    fetchChallengeData();
    
    const newChannel = supabase.channel(`match-${matchId}`);
    newChannel
      .on('broadcast', { event: 'draw-event' }, (payload) => {
        if (role === 'creator' && canvasRef.current) {
          canvasRef.current.applyRemoteEvent(payload.payload.event);
        }
      })
      .on('broadcast', { event: 'match-finished' }, (payload) => {
        if (role === 'creator') {
          const finalDrawing = payload.payload.drawing;
          setGuesserDrawing(finalDrawing.drawing);
          setRoundDrawings(prev => [...prev, finalDrawing]);
          setMatchState('results');
        }
      })
      .on('broadcast', { event: 'slider-moved' }, (payload) => {
        if (role === 'guesser') {
          setSliderValue(payload.payload.value);
        }
      })
      .on('broadcast', { event: 'hint-sent' }, (payload) => {
        advanceToNextRound(payload.payload.hint);
      })
      .on('broadcast', { event: 'round-finished' }, (payload) => {
        if (role === 'creator') {
            if (clockRef.current) {
                clockRef.current.stopTimer();
            }
            if (payload.payload.drawing) {
                setRoundDrawings(prev => [...prev, payload.payload.drawing]);
            }
            setMatchState('between-rounds');
        }
      })
      .on('broadcast', { event: 'clear-canvas' }, () => {
        if (role === 'creator' && canvasRef.current) {
            canvasRef.current.clear();
        }
      })
      .on('broadcast', { event: 'leave' }, () => {
        if (matchStateRef.current !== 'results') {
          setOpponentLeft(true);
        }
      })
      .subscribe();
    
    setChannel(newChannel);

    return () => {
      if (newChannel) {
        // Only send leave event if match is not already over
        if (matchStateRef.current !== 'results') {
          newChannel.send({
            type: 'broadcast',
            event: 'leave',
          });
        }
        supabase.removeChannel(newChannel);
      }
    };
  }, [matchId, role, supabase]);

  const handleDrawEvent = (event: DrawEvent) => {
    if (role === 'guesser' && channel) {
      channel.send({
        type: 'broadcast',
        event: 'draw-event',
        payload: { event },
      });
    }
  };

  const advanceToNextRound = (hint: string) => {
    setHints((prevHints) => [...prevHints, hint]);
    setTimeout(() => {
        setMatchState('live');
        setRound((prevRound) => prevRound + 1);
        if (clockRef.current) {
            clockRef.current.startTimer();
        }
    }, 3000);
  };

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    if (role === 'creator' && channel) {
      channel.send({
        type: 'broadcast',
        event: 'slider-moved',
        payload: { value: newValue },
      });
    }
  };

  const handleDone = () => {
    if (clockRef.current) {
      clockRef.current.stopTimer();
    }
    const drawing = canvasRef.current?.getDrawingAsSvg();
    const roundDrawing = drawing ? { id: Math.random(), round, drawing } : null;
    
    if (roundDrawing) {
        setRoundDrawings(prev => [...prev, roundDrawing]);
    }
    
    if (round < 3) {
        setMatchState('between-rounds');
        if (role === 'guesser' && channel) {
            channel.send({
                type: 'broadcast',
                event: 'round-finished',
                payload: { drawing: roundDrawing },
            });
        }
    } else {
        setMatchState('results');
        if (role === 'guesser' && channel) {
            if (roundDrawing) {
                setGuesserDrawing(roundDrawing.drawing);
                channel.send({
                type: 'broadcast',
                event: 'match-finished',
                payload: { drawing: roundDrawing },
                });
            }
            if (matchId) {
                fetch(`/api/match/${matchId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'completed' }),
                });
            }
        }
    }
  };

  const handleSendHint = () => {
    if (role === 'creator' && channel && hintInput.trim()) {
        const hint = hintInput.trim();
        channel.send({
            type: 'broadcast',
            event: 'hint-sent',
            payload: { hint },
        });
        setHintInput('');
        advanceToNextRound(hint);
        setIsHintInputVisible(false);
    }
  };

  const handleChallengeIt = async () => {
    if (!cards.length || !creatorDrawing) return;
    setIsChallengeButtonDisabled(true);

    const topCard = cards[0];

    const { success, matchId: newMatchId } = await createMatchWithChallenge(topCard.drawing, creatorDrawing.svg, creatorDrawing.viewBox);
      
    if (success && newMatchId) {
        router.push(`/match/waiting/${newMatchId}`);
    } else {
        console.error("Failed to create new match");
        setIsChallengeButtonDisabled(false);
    }
  };

  const handleKeep = async () => {
    if (!cards.length) return;

    const topCard = cards[0];
    if (savedDrawings.has(topCard.id)) return;

    // Validate drawing content before attempting to save
    if (!topCard.drawing || topCard.drawing.trim().length === 0) {
      alert("Drawing content is empty!");
      return;
    }

    // Check if drawing contains actual content
    if (!topCard.drawing.includes('<path') && !topCard.drawing.includes('<g')) {
      alert("Drawing appears to be empty!");
      return;
    }

    try {
      const result = await saveDrawing(topCard.drawing, `Match Drawing - Round ${topCard.round}`);

      if (result.success) {
          setSavedDrawings(prev => new Set(prev).add(topCard.id));
          console.log("Drawing saved successfully!");
      } else {
          console.error("Failed to save drawing:", result.error);
          alert(`Failed to save drawing: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Save operation failed:", error);
      alert("Failed to save drawing. Please try again.");
    }
  };

  const downloadPngFromCanvas = (canvas: HTMLCanvasElement) => {
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'hotdot-drawing.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (!cards.length) return;
    let svgString = cards[0].drawing;

    // Inject a style to prevent unwanted fills
    if (svgString && svgString.includes('<svg')) {
      svgString = svgString.replace(
        /(<svg[^>]*>)/,
        `$1<style>path { fill: none; }</style>`
      );
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || 500;
      canvas.height = img.height || 500;
      
      // Set a white background for the exported image
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      if (isMobile && navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'hotdot-drawing.png', { type: 'image/png' });
          try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'HotDot Drawing',
                    text: 'Check out this drawing I made on HotDot!',
                });
            } else {
                downloadPngFromCanvas(canvas);
            }
          } catch (error) {
            console.error('Error sharing:', error);
            downloadPngFromCanvas(canvas);
          }
        }, 'image/png');
      } else {
        downloadPngFromCanvas(canvas);
      }
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
        console.error("Failed to load SVG for sharing.");
    };

    img.src = url;
  };
  
  useEffect(() => {
    if (matchState === 'results') {
        const sortedDrawings = [...roundDrawings].sort((a, b) => b.round - a.round);
        setCards(sortedDrawings);
    }
  }, [matchState, roundDrawings]);

  const handleSwipe = (swipedCard: RoundDrawing) => {
    setCards(prevCards => {
        const newCards = prevCards.filter(card => card !== swipedCard);
        return [...newCards, swipedCard]; // Add swiped card to the end
    });
  };

  if (matchState === 'results') {
    return (
      <div className="canvas-page-wrapper">
        <div className="canvas-page-responsive">
          <Link href="/" className="absolute top-4 left-4 z-20">
              <Image
                  src="/assets/Exit_Button.svg"
                  alt="Exit to Home"
                  width={41}
                  height={41}
                  className="transition-transform hover:scale-110"
              />
          </Link>
          <header className="canvas-header-responsive text-center">
            <h1 className="font-bold mb-4 font-sans">Results</h1>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
            <div className="flex flex-row gap-4 w-full max-w-4xl max-h-full">
              <div className="flex-1 flex flex-col items-center min-h-0">
                <h2 className="font-semibold mb-2 font-sans">Creator's Drawing</h2>
                <div className="aspect-square w-full rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-100 max-h-full">
                  {creatorDrawing && <AnimatedSvg svgContent={creatorDrawing.svg} />}
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center min-h-0">
                <h2 className="font-semibold mb-2 font-sans">Guesser's Drawings</h2>
                <div className="relative w-full aspect-square flex items-center justify-center max-h-full">
                    <AnimatePresence>
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                className="absolute w-full h-full"
                                style={{
                                    zIndex: cards.length - index,
                                }}
                                initial={{ scale: 1, y: 20, x: -20, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    x: (cards.length - 1 - index) * -10,
                                    y: (cards.length - 1 - index) * 10,
                                    opacity: 1,
                                }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                drag
                                dragSnapToOrigin
                                onDragEnd={(event, info) => {
                                    const swipeThreshold = 100;
                                    if (Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2) > swipeThreshold) {
                                        handleSwipe(card);
                                    }
                                }}
                            >
                                <div className="aspect-square w-full rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-100 shadow-lg">
                                    <AnimatedSvg svgContent={card.drawing} />
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded font-sans">
                                        Round {card.round}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
              </div>
            </div>
          </main>
          <footer className="canvas-footer-responsive flex flex-col gap-2 items-center">
              <Button 
                  onClick={handleKeep}
                  variant="primaryCta"
                  className="w-full max-w-xs"
                  disabled={cards.length > 0 && savedDrawings.has(cards[0].id)}
              >
                  {cards.length > 0 && savedDrawings.has(cards[0].id) ? 'SAVED' : 'KEEP'}
              </Button>
              <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-white text-black font-sans w-full max-w-xs border border-gray-300"
              >
                  SHARE
              </Button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-page-wrapper">
      <div className="canvas-page-responsive">
        <Link href="/" className="absolute top-4 left-4 z-20">
            <Image
                src="/assets/Exit_Button.svg"
                alt="Exit to Home"
                width={41}
                height={41}
                className="transition-transform hover:scale-110"
            />
        </Link>
        <header className="canvas-header-responsive flex flex-col items-center">
          <Clock
            ref={clockRef}
            onCountdownFinish={handleDone}
          />
          <p className="font-bold font-sans -mt-1">Round {round}/3</p>
          <h1 className="font-bold mt-1 font-sans">
            {role === 'guesser' ? 'Your turn to draw!' : 'the other player is drawing...'}
          </h1>
        </header>
        <main className="canvas-main-responsive">
          <div className="canvas-container-responsive">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/assets/Card_1.svg')" }}
            ></div>
            <div className="absolute inset-0">
              <DrawableCanvas
                ref={canvasRef}
                isLocked={role !== 'guesser' || matchState !== 'live'}
                onDrawEvent={handleDrawEvent}
              />
            </div>
          </div>
        </main>
        <div className="w-full px-4 pb-2 text-center min-h-[60px] flex flex-col justify-center">
          {hints.map((hint, index) => (
              <div key={index} className="text-sm my-1 font-sans">
                  <strong>Hint {index + 1}:</strong> {hint}
              </div>
          ))}
        </div>
        <footer className="canvas-footer-responsive flex flex-col items-center gap-4">
          {matchState === 'live' && (
              <>
                  <HotColdSlider
                      value={sliderValue}
                      onValueChange={handleSliderChange}
                      disabled={role !== 'creator'}
                  />
                  {role === 'guesser' && (
                      <div className="flex items-center gap-4">
                          <Button
                              variant="outline"
                              onClick={() => {
                                  if (canvasRef.current) {
                                      canvasRef.current.clear();
                                  }
                                  if (channel) {
                                      channel.send({
                                          type: 'broadcast',
                                          event: 'clear-canvas',
                                          payload: {},
                                      });
                                  }
                              }}
                              className="font-sans"
                          >
                              Clear
                          </Button>
                          <Button
                              onClick={handleDone}
                              variant="primaryCta"
                              className="font-sans"
                          >
                              done
                          </Button>
                      </div>
                  )}
              </>
          )}
          {matchState === 'between-rounds' && (
              <div className='h-20 flex flex-col items-center justify-center'>
                  {role === 'guesser' ? (
                      <p className="font-semibold font-sans">Waiting for hint...</p>
                  ) : (
                      <>
                      {isMobile && !isHintInputVisible ? (
                          <Button variant="ghost" onClick={() => setIsHintInputVisible(true)}>
                              <Image src="/assets/keyboard.svg" alt="Open keyboard to type hint" width={40} height={39} />
                          </Button>
                      ) : (
                          <div className="flex items-center gap-2 w-full px-4">
                              <input
                                  ref={hintInputRef}
                                  type="text"
                                  value={hintInput}
                                  onChange={(e) => setHintInput(e.target.value)}
                                  maxLength={56}
                                  placeholder="Type your hint here"
                                  className="border rounded px-2 py-1 flex-grow font-sans text-sm"
                              />
                              <Button onClick={handleSendHint} variant="primaryCta" className="font-sans">Send</Button>
                          </div>
                      )}
                      </>
                  )}
              </div>
          )}
        </footer>

        <AlertDialog open={opponentLeft}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Opponent Left</AlertDialogTitle>
              <AlertDialogDescription>
                Your opponent has left the match. You can return to the homepage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => router.push('/')}>
                Go to Homepage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 