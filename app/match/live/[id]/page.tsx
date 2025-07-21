'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DrawableCanvas, { DrawableCanvasRef, Point } from '@/components/drawable-canvas';
import { Button } from '@/components/ui/button';

export default function LiveMatchPage() {
  const router = useRouter();
  const { id: matchId } = useParams();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [supabase] = useState(() => createClient());
  const [channel, setChannel] = useState<any>(null);

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
    };

    fetchChallengeData();
    
    const newChannel = supabase.channel(`match-${matchId}`);
    newChannel
      .on('broadcast', { event: 'draw' }, (payload) => {
        if (role === 'creator' && canvasRef.current) {
          canvasRef.current.drawRemote(payload.payload.points);
        }
      })
      .subscribe();
    
    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [matchId, role, supabase]);

  const handleDraw = (points: Point[]) => {
    if (role === 'guesser' && channel) {
      channel.send({
        type: 'broadcast',
        event: 'draw',
        payload: { points },
      });
    }
  };

  return (
    <div className="flex flex-col h-screen-dynamic">
      <header className="p-4 text-center">
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
              onDraw={handleDraw}
            />
          </div>
        </div>
      </main>
      <footer className="p-4 flex justify-center">
        <Button onClick={() => router.push('/')}>End Match</Button>
      </footer>
    </div>
  );
} 