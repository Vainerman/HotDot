
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

  const [opponentName, setOpponentName] = useState('');
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (!matchId) return;

    const fetchOpponentData = async () => {
      const { data: match, error } = await supabase
        .from('matches')
        .select('creator_id, guesser_id, creator_name, guesser_name')
        .eq('id', matchId)
        .single();

      if (error || !match) {
        console.error('Error fetching match:', error);
        return;
      }
      
      const opponentName = role === 'creator' ? match.guesser_name : match.creator_name;
      if (opponentName) {
          setOpponentName(opponentName);
      } else {
          console.error('Opponent name not found in match data.');
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
    <div className="flex flex-col items-center justify-start h-screen pt-20 bg-[#1A1A1A] text-white">
      <div className="z-10 text-center">
        <div className="flex justify-center items-center space-x-4 mb-4">
            <Image src="/assets/waiting-page-icons/profile.svg" alt="Player 1" width={100} height={100} className="-rotate-6" />
        </div>
        <h1 className="text-3xl font-bold uppercase" style={{ fontFamily: 'Space Grotesk' }}>it’s a match</h1>
        <p className="text-md" style={{ fontFamily: 'Space Grotesk' }}>
          {role === 'creator' ? `It’s a match, ${opponentName} will guess` : `Try to guess what ${opponentName} drew`}
        </p>
      </div>
      <div className="absolute bottom-8 z-10">
        <Button onClick={handleStart} disabled={userReady} className="w-80 h-14 bg-[#FF6338] hover:bg-[#C9330A] text-black text-3xl font-bold uppercase rounded-[11.55px]" style={{ fontFamily: 'Space Grotesk' }}>
          {userReady ? "Waiting..." : "Start now"}
        </Button>
      </div>
    </div>
  );
} 