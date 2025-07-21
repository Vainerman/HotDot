"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function GuessMatchPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const join = async () => {
      const res = await fetch('/api/match/join', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const channel = supabase.channel(`match-${data.id}`);
        channel.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            await channel.send({ type: 'broadcast', event: 'start', payload: {} });
            router.push(`/match/${data.id}?role=guesser&challenge=${data.challengeId}`);
          }
        });
      } else {
        console.error(data.error);
      }
    };

    join();
  }, [router, supabase]);

  return (
    <div className="flex items-center justify-center h-full text-xl">Finding a match...</div>
  );
}
