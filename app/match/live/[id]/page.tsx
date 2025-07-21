'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DrawableCanvas, { DrawableCanvasRef, DrawEvent } from '@/components/drawable-canvas';
import { Button } from '@/components/ui/button';
import Clock, { ClockRef } from '@/components/clock';
import AnimatedSvg from '@/components/animated-svg';
import HotColdSlider from '@/components/hot-cold-slider';

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
  const [guesserDrawing, setGuesserDrawing] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [round, setRound] = useState(1);
  const [hints, setHints] = useState<string[]>([]);
  const [hintInput, setHintInput] = useState('');

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
          setGuesserDrawing(payload.payload.drawing);
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
      .on('broadcast', { event: 'round-finished' }, () => {
        if (role === 'creator') {
            if (clockRef.current) {
                clockRef.current.stopTimer();
            }
            setMatchState('between-rounds');
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
    
    if (round < 3) {
        setMatchState('between-rounds');
        if (role === 'guesser' && channel) {
            channel.send({
                type: 'broadcast',
                event: 'round-finished',
                payload: {},
            });
        }
    } else {
        setMatchState('results');
        if (role === 'guesser' && channel) {
            const drawing = canvasRef.current?.getDrawingAsSvg();
            if (drawing) {
                setGuesserDrawing(drawing);
                channel.send({
                type: 'broadcast',
                event: 'match-finished',
                payload: { drawing },
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
    }
  };

  if (matchState === 'results') {
    return (
      <div className="flex flex-col h-screen-dynamic items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8">Results</h1>
        <div className="flex flex-row gap-4 w-full max-w-4xl">
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Creator's Drawing</h2>
            <div className="aspect-square w-full rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-100">
              {creatorDrawing && <AnimatedSvg svgContent={creatorDrawing.svg} />}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Guesser's Drawing</h2>
            <div className="aspect-square w-full rounded-lg overflow-hidden relative flex items-center justify-center bg-gray-100">
              {guesserDrawing && <AnimatedSvg svgContent={guesserDrawing} />}
            </div>
          </div>
        </div>
        <Button onClick={() => router.push('/')} className="mt-8">
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen-dynamic">
      <header className="p-4 text-center">
        <Clock
          ref={clockRef}
          onCountdownFinish={handleDone}
        />
        <h1 className="text-xl font-bold">
          {role === 'guesser' ? 'Your turn to draw!' : 'Your partner is drawing...'}
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
      <div className="px-4 pb-2">
        {hints.map((hint, index) => (
            <div key={index} className="text-center text-sm my-1 p-1 bg-gray-100 rounded-md">
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
                    <Button
                        onClick={handleDone}
                        className="bg-[#FF6338] text-[#1A1A1A] hover:bg-[#FF6338]/90 text-[35px] font-bold uppercase rounded-xl h-auto px-8 py-2 font-sans"
                    >
                        done
                    </Button>
                )}
            </>
        )}
        {matchState === 'between-rounds' && (
            <div className='h-[108px] flex flex-col items-center justify-center'>
                {role === 'guesser' ? (
                    <p className="text-lg font-semibold">Waiting for hint...</p>
                ) : (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={hintInput}
                            onChange={(e) => setHintInput(e.target.value)}
                            maxLength={56}
                            placeholder="Type your hint here"
                            className="border rounded px-2 py-1 flex-grow"
                        />
                        <Button onClick={handleSendHint}>Send</Button>
                    </div>
                )}
            </div>
        )}
      </footer>
    </div>
  );
} 