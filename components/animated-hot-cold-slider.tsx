"use client";

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';

const AnimatedHotColdSlider = () => {
  const [value, setValue] = useState(50); // 0-100, 50 is neutral

  const getBackgroundColor = () => {
    if (value < 50) {
      // Blue for cold
      const alpha = ((50 - value) / 50) * 0.5; // Opacity from 0 to 0.5
      return `rgba(59, 130, 246, ${alpha})`;
    }
    // Red for hot
    const alpha = ((value - 50) / 50) * 0.5; // Opacity from 0 to 0.5
    return `rgba(239, 68, 68, ${alpha})`;
  };

  return (
    <div className="relative w-64 h-16 bg-gray-200 rounded-full flex items-center px-4">
      <span className="text-gray-500 font-semibold">Cold</span>
      <div className="flex-1 h-full mx-4 relative flex items-center">
        <motion.div
          className="absolute left-0 top-0 h-full w-full rounded-full"
          style={{ backgroundColor: getBackgroundColor() }}
          animate={{ backgroundColor: getBackgroundColor() }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className="w-8 h-8 bg-white rounded-full shadow-md z-10"
          style={{
            position: 'absolute',
            left: `calc(${value}% - 16px)`,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 160 }}
          dragElastic={0.1}
          onDrag={(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            // This is a simplified drag handler. A real one would be more robust.
            // Width of track is 160px (256px total - 32px padding - 64px labels)
            const newValue = (info.point.x / 160) * 100;
            setValue(Math.max(0, Math.min(100, newValue)));
          }}
          animate={{ x: (value / 100) * 160 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className="text-gray-500 font-semibold">Hot</span>
    </div>
  );
};

export default AnimatedHotColdSlider;
