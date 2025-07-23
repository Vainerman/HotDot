"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

export default function GuessMatchPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const searchStartTime = Date.now();
    const searchDuration = 10000; // 10 seconds
    const pollFrequency = 2000; // every 2 seconds

    let pollTimer: NodeJS.Timeout;

    const attemptToJoinMatch = async () => {
      // If time is up, stop polling and show message
      if (Date.now() - searchStartTime > searchDuration) {
        clearInterval(pollTimer);
        setStatusMessage('No available matches found. Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      try {
        const res = await fetch('/api/match/join', {
          method: 'POST',
        });

        // If we found a match (200 OK)
        if (res.ok) {
          const data = await res.json();
          if (data.matchId) {
            clearInterval(pollTimer);
            router.push(`/match/pre-match/${data.matchId}?role=guesser`);
          }
        }
        // If res is not ok (e.g., 404), the catch block won't run, and we'll just try again on the next interval.
      } catch (error) {
        console.error('Failed to join a match on this attempt:', error);
        // We'll just keep polling on error
      }
    };

    // Poll immediately and then on an interval.
    attemptToJoinMatch();
    pollTimer = setInterval(attemptToJoinMatch, pollFrequency);

    // Cleanup interval on component unmount.
    return () => clearInterval(pollTimer);
  }, [router]);

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
