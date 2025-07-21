
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function PreMatchPage() {
  const router = useRouter();
  const { id: matchId } = useParams();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const [opponentEmail, setOpponentEmail] = useState('');
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (!matchId) return;

    const fetchOpponentData = async () => {
      const { data: match, error } = await supabase
        .from('matches')
        .select('creator_id, guesser_id')
        .eq('id', matchId)
        .single();

      if (error || !match) {
        console.error('Error fetching match:', error);
        return;
      }
      
      const opponentId = role === 'creator' ? match.guesser_id : match.creator_id;

      if (!opponentId) {
        // This can happen if the guesser hasn't been set yet, though unlikely on this page.
        return;
      }
      
      const res = await fetch(`/api/user/${opponentId}`);
      const userData = await res.json();
      
      if (res.ok && userData.email) {
          setOpponentEmail(userData.email);
      } else {
          console.error('Failed to fetch opponent email:', userData.error);
      }
    };

    fetchOpponentData();

    const channel = supabase.channel(`pre-match-${matchId}`);
    channel
      .on('broadcast', { event: 'ready' }, ({ payload }) => {
        if (payload.role !== role) {
          setOpponentReady(true);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };

  }, [matchId, role, supabase]);

  useEffect(() => {
    if (userReady && opponentReady) {
      router.push(`/match/live/${matchId}?role=${role}`);
    }
  }, [userReady, opponentReady, matchId, role, router]);

  const handleStart = () => {
    setUserReady(true);
    const channel = supabase.channel(`pre-match-${matchId}`);
    channel.send({
      type: 'broadcast',
      event: 'ready',
      payload: { role },
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white">
      <div className="z-10 text-center">
        <div className="flex justify-center items-center space-x-4 mb-8">
            <Image src="/assets/waiting-page-icons/profile.svg" alt="Player 1" width={140} height={140} className="-rotate-6" />
        </div>
        <h1 className="text-4xl font-bold uppercase" style={{ fontFamily: 'Space Grotesk' }}>it’s a match</h1>
        <p className="text-lg" style={{ fontFamily: 'Space Grotesk' }}>
          {role === 'creator' ? `It’s a match, ${opponentEmail} will guess` : `It's a match, you will guess`}
        </p>
      </div>
      <div className="absolute bottom-8 z-10">
        <Button onClick={handleStart} disabled={userReady} className="w-80 h-14 bg-[#FF6338] hover:bg-[#C9330A] text-black text-4xl font-bold uppercase rounded-[11.55px]" style={{ fontFamily: 'Space Grotesk' }}>
          {userReady ? "Waiting..." : "Start now"}
        </Button>
      </div>
    </div>
  );
} 