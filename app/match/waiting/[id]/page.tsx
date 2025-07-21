
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import AnimatedCat from '@/components/animated-cat';

export default function WaitingForGuesserPage() {
  const router = useRouter();
  const { id: matchId } = useParams();

  useEffect(() => {
    if (!matchId) return;

    const supabase = createClient();
    const channel = supabase.channel(`match-${matchId}`);

    channel
      .on('broadcast', { event: 'guesser-joined' }, (payload) => {
        console.log('Guesser joined!', payload);
        router.push(`/match/live/${matchId}?role=creator`);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to match-${matchId}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Waiting for a guesser...</h1>
      <AnimatedCat />
      <p className="mt-4 text-gray-600">You'll be redirected automatically when someone joins.</p>
    </div>
  );
} 