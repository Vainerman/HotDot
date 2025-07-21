"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface HotColdSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export default function HotColdSlider({ value, onValueChange, disabled }: HotColdSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.offsetWidth;
      
      const sliderPercentage = (value - 0) / (100 - 0);
      
      const maxTextOffset = textWidth - containerWidth;
      const textOffset = (1 - sliderPercentage) * maxTextOffset;

      textRef.current.style.transform = `translateX(-${textOffset}px)`;
    }
  }, [value]);

  const handleSliderChange = (sliderValue: number[]) => {
    onValueChange(sliderValue[0]);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm overflow-hidden">
      <div
        ref={textRef}
        className="flex items-center transition-transform duration-100 ease-linear"
        style={{ width: 'max-content' }}
      >
        <span className="text-5xl font-space-grotesk text-[#979797] pr-6">FREZZING</span>
        <span className="text-5xl font-space-grotesk text-[#1A1A1A] pr-6">COLD</span>
        <span className="text-5xl font-space-grotesk text-[#979797] pr-6">WARM</span>
        <span className="text-5xl font-space-grotesk text-[#1A1A1A]">HOT</span>
      </div>
      <div className="absolute inset-0">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
}
