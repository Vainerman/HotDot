"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface ChallengeHeaderRef {
  stopTimer: () => void;
}

interface AnimatedChallengeHeaderProps {
  onCountdownStart: () => void;
  onCountdownFinish: () => void;
}

const AnimatedChallengeHeader = forwardRef<ChallengeHeaderRef, AnimatedChallengeHeaderProps>(
  ({ onCountdownStart, onCountdownFinish }, ref) => {
    const [step, setStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isFinished, setIsFinished] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      stopTimer() {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsFinished(true); // Prevent onCountdownFinish from being called again
      },
    }));

    const slides = [
      { id: 0, text: 'SHAPE OF THE DAY', icon: '/assets/rightVector.svg', iconWidth: 28, iconHeight: 29 },
      { id: 1, text: '1,457 DRAWINGS TODAY', icon: '/assets/rightVector.svg', iconWidth: 28, iconHeight: 29 },
      { id: 2, text: `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`, icon: '/assets/clock.svg', iconWidth: 25, iconHeight: 39 },
    ];

    useEffect(() => {
      // Sequence animation
      const timer1 = setTimeout(() => setStep(1), 3000);
      const timer2 = setTimeout(() => setStep(2), 6000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }, []);

    useEffect(() => {
      // Countdown timer logic
      if (step === 2 && timeLeft > 0 && !isFinished) {
        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      } else if (timeLeft === 0 && !isFinished) {
        onCountdownFinish();
        setIsFinished(true);
      } else if (step === 2 && timeLeft === 30) {
        onCountdownStart();
      }
    }, [step, timeLeft, onCountdownStart, onCountdownFinish, isFinished]);

    const slideVariants = {
      enter: { x: '-100%' },
      center: { x: 0 },
      exit: { x: '100%' },
    };

    return (
      <div className="w-full max-w-lg h-16 flex items-center justify-center bg-transparent overflow-hidden relative">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
            className="text-black text-3xl font-bold tracking-tight uppercase absolute"
          >
            <div className="flex items-center justify-center gap-4">
              <Image
                src={slides[step].icon}
                width={slides[step].iconWidth}
                height={slides[step].iconHeight}
                alt="Slide icon"
              />
              <span>{slides[step].text}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedChallengeHeader.displayName = 'AnimatedChallengeHeader';

export default AnimatedChallengeHeader;
