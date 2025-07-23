
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

export default function WaitingForGuesserPage() {
  const router = useRouter();
  const { id: matchId } = useParams();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!matchId) return;

    const timeoutDuration = 15000; // 15 seconds

    const timeoutId = setTimeout(async () => {
      setStatusMessage("Couldn't find a player. Redirecting...");
      // Update the match to failed so it's no longer available
      await fetch(`/api/match/${matchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed' }),
      });
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }, timeoutDuration);

    const supabase = createClient();
    const channel = supabase.channel(`match-${matchId}`);

    channel
      .on('broadcast', { event: 'guesser-joined' }, (payload) => {
        clearTimeout(timeoutId); // Guesser found, cancel the timeout
        console.log('Guesser joined!', payload);
        router.push(`/match/pre-match/${matchId}?role=creator`);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to match-${matchId}`);
        }
      });

    return () => {
      clearTimeout(timeoutId); // Clean up the timeout if the component unmounts
      supabase.removeChannel(channel);

      // If the user navigates away, cancel the match.
      // We don't need to wait for the response.
      fetch(`/api/match/${matchId}`, {
        method: 'DELETE',
        keepalive: true, // Ensure the request is sent even if the page is closing
      });
    };
  }, [matchId, router]);

  const dotsContainer: Variants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dot: Variants = {
    initial: { y: '0%' },
    animate: {
      y: '-40%',
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white">
        <div className="absolute top-6 left-6">
            <Link href="/">
                <Image src="/assets/waiting-page-icons/search-icon.svg" alt="Search Icon" width={41} height={41} />
            </Link>
        </div>
      <div className="text-center">
        {statusMessage ? (
          <h1 className="text-4xl font-bold uppercase" style={{ fontFamily: 'Space Grotesk' }}>
            {statusMessage}
          </h1>
        ) : (
          <>
            <h1 className="text-4xl font-bold uppercase flex items-end" style={{ fontFamily: 'Space Grotesk' }}>
              <span>searching</span>
              <motion.div
                variants={dotsContainer}
                initial="initial"
                animate="animate"
                className="flex"
                style={{ lineHeight: '0.5' }}
              >
                <motion.span variants={dot}>.</motion.span>
                <motion.span variants={dot}>.</motion.span>
                <motion.span variants={dot}>.</motion.span>
              </motion.div>
            </h1>
            <p className="text-lg" style={{ fontFamily: 'Space Grotesk' }}>Looking for another player</p>
          </>
        )}
      </div>
      <div className="absolute bottom-8">
        <Button variant="primaryCta" className="w-80 h-14 text-4xl" disabled>
          Start now
        </Button>
      </div>
    </div>
  );
} 