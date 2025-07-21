"use client";
import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function MatchWaitingPage() {
  const { id } = useParams();
  const search = useSearchParams();
  const challengeId = search.get('challenge');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`match-${id}`);
    channel.on('broadcast', { event: 'start' }, () => {
      router.push(`/match/${id}?role=creator&challenge=${challengeId}`);
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, router, supabase, challengeId]);

  return (
    <div className="flex items-center justify-center h-full text-xl">Waiting for a guesser...</div>
  );
}
