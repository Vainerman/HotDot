
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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
        router.push(`/match/pre-match/${matchId}?role=creator`);
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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white">
        <div className="absolute top-6 left-6">
            <Image src="/assets/waiting-page-icons/search-icon.svg" alt="Search Icon" width={41} height={41} />
        </div>
        <div className="absolute top-6 right-6">
            <Image src="/assets/waiting-page-icons/profile.svg" alt="Profile Icon" width={41} height={41} />
        </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold uppercase" style={{ fontFamily: 'Space Grotesk' }}>searching...</h1>
        <p className="text-lg" style={{ fontFamily: 'Space Grotesk' }}>Looking for another player</p>
      </div>
      <div className="absolute bottom-8">
        <div className="relative w-80 h-14 opacity-30">
            <div className="absolute inset-x-0 bottom-0 h-full bg-[#C9330A] rounded-[13px]"></div>
            <div className="absolute inset-0 bg-[#FF6338] rounded-[11.55px] flex items-center justify-center">
                <span className="text-4xl font-bold uppercase" style={{ fontFamily: 'Space Grotesk' }}>Start now</span>
            </div>
        </div>
      </div>
    </div>
  );
} 