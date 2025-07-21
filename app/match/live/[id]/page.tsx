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
import { createChallenge } from '@/app/actions';

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
        .select('challenge_id')
        .eq('id', matchId)
        .single();
    
      if (matchError || !matchData || !matchData.challenge_id) {
        console.error('Error fetching match data or challenge not ready:', matchError);
        return;
      }

      const { data, error } = await supabase
        .from('challenges')
        .select('template_svg, template_viewbox, creator_drawing_svg')
        .eq('id', matchData.challenge_id)
        .single();

      if (error || !data) {
        console.error('Failed to fetch challenge data:', error);
        return;
      }
      
      if (canvasRef.current) {
        canvasRef.current.animateSvg(data.template_svg, data.template_viewbox);
      }

      setCreatorDrawing({ 
        svg: data.creator_drawing_svg || data.template_svg, 
        viewBox: data.template_viewbox 
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
      .subscribe();
    
    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
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

    // 1. Create a match to get an ID
    const matchResponse = await fetch('/api/match/create', { method: 'POST' });
    const { id: matchId, error: matchError } = await matchResponse.json();

    if (matchError) {
      console.error('Failed to create match:', matchError);
      return;
    }

    // 2. Navigate immediately
    router.push(`/match/waiting/${matchId}`);

    // 3. Create challenge and update match in the background
    (async () => {
      const challengeRes = await createChallenge(topCard.drawing, creatorDrawing.svg, creatorDrawing.viewBox);
      
      if (challengeRes?.success && challengeRes.id) {
        const updateResponse = await fetch(`/api/match/${matchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challenge_id: challengeRes.id, status: 'waiting' }),
        });

        if (!updateResponse.ok) {
          const { error } = await updateResponse.json();
          console.error('Failed to update match:', error);
        }
      } else {
        console.error(challengeRes?.error || "Failed to create challenge");
        await fetch(`/api/match/${matchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed' }),
        });
      }
    })();
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
    const svgString = cards[0].drawing;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || 500;
      canvas.height = img.height || 500;
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
      <div className="relative flex flex-col h-screen-dynamic items-center justify-center p-4">
        <Link href="/" className="absolute top-4 left-4 z-20">
            <Image
                src="/assets/Exit_Button.svg"
                alt="Exit to Home"
                width={41}
                height={41}
                className="transition-transform hover:scale-110"
            />
        </Link>
        <h1 className="text-3xl font-bold mb-8 font-sans">Results</h1>
        <div className="flex flex-row gap-4 w-full max-w-4xl">
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2 font-sans">Creator's Drawing</h2>
            <div className="aspect-square w-full rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-100">
              {creatorDrawing && <AnimatedSvg svgContent={creatorDrawing.svg} />}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2 font-sans">Guesser's Drawings</h2>
            <div className="relative w-full aspect-square flex items-center justify-center">
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
        <div className="mt-8 flex flex-col gap-4 items-center">
            <Button 
                onClick={handleChallengeIt}
                className="bg-[#FF6338] text-[#1A1A1A] hover:bg-[#FF6338]/90 text-[35px] font-bold uppercase rounded-xl h-auto px-8 py-2 font-sans w-[326px]"
                disabled={isChallengeButtonDisabled}
            >
                CHALLENGE IT
            </Button>
            <Button
                onClick={handleShare}
                variant="outline"
                className="bg-white text-black text-lg font-sans w-[326px] border border-gray-300"
            >
                SHARE
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen-dynamic">
      <Link href="/" className="absolute top-4 left-4 z-20">
          <Image
              src="/assets/Exit_Button.svg"
              alt="Exit to Home"
              width={41}
              height={41}
              className="transition-transform hover:scale-110"
          />
      </Link>
      <header className="p-4 flex flex-col items-center">
        <Clock
          ref={clockRef}
          onCountdownFinish={handleDone}
        />
        <p className="text-lg font-bold font-sans -mt-2">Round {round}/3</p>
        <h1 className="text-xl font-bold mt-2 font-sans">
          {role === 'guesser' ? 'Your turn to draw!' : 'the other player is drawing...'}
        </h1>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: '346 / 562' }}>
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
      <div className="w-full max-w-sm mx-auto px-4 pb-2">
        {hints.map((hint, index) => (
            <div key={index} className="text-left text-sm my-1 p-1 font-sans">
                <strong>Hint {index + 1}:</strong> {hint}
            </div>
        ))}
      </div>
      <footer className="p-4 flex flex-col items-center gap-4">
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
                            className="text-lg font-sans"
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={handleDone}
                            className="bg-[#FF6338] text-[#1A1A1A] hover:bg-[#FF6338]/90 text-[35px] font-bold uppercase rounded-xl h-auto px-8 py-2 font-sans"
                        >
                            done
                        </Button>
                    </div>
                )}
            </>
        )}
        {matchState === 'between-rounds' && (
            <div className='h-[108px] flex flex-col items-center justify-center'>
                {role === 'guesser' ? (
                    <p className="text-lg font-semibold font-sans">Waiting for hint...</p>
                ) : (
                    <>
                    {isMobile && !isHintInputVisible ? (
                        <Button variant="ghost" onClick={() => setIsHintInputVisible(true)}>
                            <Image src="/assets/keyboard.svg" alt="Open keyboard to type hint" width={48} height={47} />
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
                                className="border rounded px-2 py-1 flex-grow font-sans"
                            />
                            <Button onClick={handleSendHint} className="font-sans">Send</Button>
                        </div>
                    )}
                    </>
                )}
            </div>
        )}
      </footer>
    </div>
  );
} 