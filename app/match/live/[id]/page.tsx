'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DrawableCanvas, { DrawableCanvasRef, DrawEvent } from '@/components/drawable-canvas';
import { Button } from '@/components/ui/button';
import Clock, { ClockRef } from '@/components/clock';

export default function LiveMatchPage() {
  const router = useRouter();
  const { id: matchId } = useParams();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const clockRef = useRef<ClockRef>(null);

  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [supabase] = useState(() => createClient());
  const [channel, setChannel] = useState<any>(null);
  const [matchState, setMatchState] = useState<'live' | 'results'>('live');
  const [originalTemplate, setOriginalTemplate] = useState<{ svg: string; viewBox: string } | null>(null);
  const [guesserDrawing, setGuesserDrawing] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    // Fetch challenge template
    const fetchChallengeData = async () => {
        const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('challenge_id')
        .eq('id', matchId)
        .single();
    
      if (matchError || !matchData) {
        console.error('Error fetching match data:', matchError);
        return;
      }

      const { data, error } = await supabase
        .from('challenges')
        .select('template_svg, template_viewbox')
        .eq('id', matchData.challenge_id)
        .single();

      if (error || !data) {
        console.error('Failed to fetch challenge template:', error);
        return;
      }
      if (canvasRef.current) {
        canvasRef.current.animateSvg(data.template_svg, data.template_viewbox);
      }
      setOriginalTemplate({ svg: data.template_svg, viewBox: data.template_viewbox });
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

  const handleDone = () => {
    if (clockRef.current) {
      clockRef.current.stopTimer();
    }
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
  };

  if (matchState === 'results') {
    return (
      <div className="flex flex-col h-screen-dynamic items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8">Results</h1>
        <div className="flex flex-row gap-4 w-full max-w-4xl">
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Original</h2>
            <div
              className="w-full bg-gray-100 rounded-lg overflow-hidden"
              style={{ aspectRatio: '346 / 562' }}
              dangerouslySetInnerHTML={{ __html: originalTemplate?.svg || '' }}
            />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Your Guess</h2>
            <div
              className="w-full bg-gray-100 rounded-lg overflow-hidden"
              style={{ aspectRatio: '346 / 562' }}
              dangerouslySetInnerHTML={{ __html: guesserDrawing || '' }}
            />
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
              isLocked={role !== 'guesser'}
              onDrawEvent={handleDrawEvent}
            />
          </div>
        </div>
      </main>
      <footer className="p-4 flex justify-center">
        {role === 'guesser' && (
          <Button
            onClick={handleDone}
            className="bg-[#FF6338] text-[#1A1A1A] hover:bg-[#FF6338]/90 text-[35px] font-bold uppercase rounded-xl h-auto px-8 py-2"
          >
            done
          </Button>
        )}
      </footer>
    </div>
  );
} 