"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface ClockRef {
  stopTimer: () => void;
}

interface ClockProps {
  onCountdownFinish: () => void;
}

const Clock = forwardRef<ClockRef, ClockProps>(
  ({ onCountdownFinish }, ref) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [isFinished, setIsFinished] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      stopTimer() {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsFinished(true);
      },
    }));

    useEffect(() => {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (timeLeft === 0 && !isFinished) {
        onCountdownFinish();
        setIsFinished(true);
      }
    }, [timeLeft, onCountdownFinish, isFinished]);

    return (
      <div className="w-full max-w-lg h-16 flex items-center justify-center bg-transparent overflow-hidden relative">
        <div className="text-black text-3xl font-bold tracking-tight uppercase absolute">
          <div className="flex items-center justify-center gap-4">
            <Image
              src="/assets/clock.svg"
              width={25}
              height={39}
              alt="Clock icon"
            />
            <span>{`00:${timeLeft < 10 ? '0' : ''}${timeLeft}`}</span>
          </div>
        </div>
      </div>
    );
  }
);

Clock.displayName = 'Clock';

export default Clock; 