"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedChallengeHeader = () => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const slides = [
    { id: 0, text: '→ SHAPE OF THE DAY' },
    { id: 1, text: '1,457 DRAWINGS TODAY' },
    { id: 2, text: `00:${timeLeft < 10 ? '0' : ''}${timeLeft}` },
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
    if (step === 2 && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timeLeft]);
  
  const slideVariants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  return (
    <div className="w-full max-w-lg h-16 flex items-center justify-center bg-black overflow-hidden relative">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
          className="text-gray-300 text-3xl font-bold tracking-tight uppercase absolute"
        >
          {slides[step].text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedChallengeHeader;
