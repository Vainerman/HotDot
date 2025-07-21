"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GuessMatchPage() {
  const router = useRouter();

  useEffect(() => {
    const joinMatch = async () => {
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join' }),
        });
        const data = await res.json();
        if (res.ok && data.matchId) {
          router.push(`/match/pre-match/${data.matchId}?role=guesser`);
        } else {
          // Handle no available matches, maybe redirect to a different page or show a message
          alert(data.error || 'No available matches. Please try again later.');
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to join a match:', error);
        alert('An error occurred while trying to find a match.');
        router.push('/');
      }
    };

    // Add a small delay to allow the waiting page to render before starting the match search
    const timer = setTimeout(joinMatch, 1000);
    return () => clearTimeout(timer);

  }, [router]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white">
      <div className="absolute top-6 left-6">
          <Image src="/assets/waiting-page-icons/search-icon.svg" alt="Search Icon" width={41} height={41} />
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
