"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedCat from '@/components/animated-cat';

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

    joinMatch();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Finding a match...</h1>
      <AnimatedCat />
    </div>
  );
}
