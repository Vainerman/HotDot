"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface HotColdSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const words = ['FREZZING', 'COLD', 'WARM', 'HOT'];

export default function HotColdSlider({ value, onValueChange, disabled }: HotColdSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (containerRef.current && textRef.current && wordRefs.current.every(ref => ref)) {
      const containerWidth = containerRef.current.offsetWidth;
      
      const sliderPercentage = (value - 0) / (100 - 0);
      
      const firstWordEl = wordRefs.current[0]!;
      const lastWordEl = wordRefs.current[words.length - 1]!;

      const scrollStart = firstWordEl.offsetLeft + (firstWordEl.offsetWidth / 2) - (containerWidth / 2);
      const scrollEnd = lastWordEl.offsetLeft + (lastWordEl.offsetWidth / 2) - (containerWidth / 2);
      
      const textOffset = scrollStart + sliderPercentage * (scrollEnd - scrollStart);

      textRef.current.style.transform = `translateX(-${textOffset}px)`;

      const containerCenter = containerWidth / 2;
      let minDistance = Infinity;
      let newActiveIndex = 0;

      wordRefs.current.forEach((wordEl, index) => {
        if (wordEl) {
          const wordCenter = wordEl.offsetLeft + wordEl.offsetWidth / 2;
          const apparentCenter = wordCenter - textOffset;
          const distance = Math.abs(apparentCenter - containerCenter);

          if (distance < minDistance) {
            minDistance = distance;
            newActiveIndex = index;
          }
        }
      });

      if (activeIndex !== newActiveIndex) {
        setActiveIndex(newActiveIndex);
      }
    }
  }, [value, activeIndex]);

  const handleSliderChange = (sliderValue: number[]) => {
    onValueChange(sliderValue[0]);
  };

  return (
    <div className="hot-cold-slider w-full flex flex-col items-center gap-2">
      <div ref={containerRef} className="relative w-full max-w-sm overflow-hidden">
        <div
          ref={textRef}
          className="flex items-center transition-transform duration-100 ease-linear px-40"
          style={{ width: 'max-content' }}
        >
          {words.map((word, index) => (
            <span
              key={word}
              ref={el => { wordRefs.current[index] = el; }}
              className={cn(
                'text-5xl font-space-grotesk transition-colors',
                {
                  'text-[#1A1A1A]': activeIndex === index,
                  'text-[#979797]': activeIndex !== index,
                  'pr-6': index < words.length - 1,
                }
              )}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      <div className="w-full max-w-sm">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          disabled={disabled}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}
