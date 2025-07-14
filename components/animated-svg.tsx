"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSvgProps {
  svgUrl: string;
}

const AnimatedSvg = ({ svgUrl }: AnimatedSvgProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [viewBox, setViewBox] = useState<string | null>('0 0 100 100');

  useEffect(() => {
    const fetchAndParseSvg = async () => {
      try {
        const response = await fetch(svgUrl);
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        const viewBoxAttr = svgDoc.documentElement.getAttribute('viewBox');
        setViewBox(viewBoxAttr);
        
        const pathElements = svgDoc.querySelectorAll('path');
        const pathData = Array.from(pathElements).map(p => p.getAttribute('d') || '');
        setPaths(pathData);
      } catch (error) {
        console.error('Failed to fetch or parse SVG:', error);
      }
    };

    if (svgUrl) {
      fetchAndParseSvg();
    }
  }, [svgUrl]);

  if (!paths.length) {
    return <div className="w-full h-full bg-gray-200 animate-pulse" />;
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox || undefined}
      className="w-full h-full"
      initial="hidden"
      whileHover="visible"
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="black"
          strokeWidth="2"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: {
                pathLength: { delay: i * 0.1, type: "spring", duration: 1.5, bounce: 0 },
                opacity: { delay: i * 0.1, duration: 0.01 }
              }
            }
          }}
        />
      ))}
    </motion.svg>
  );
};

export default AnimatedSvg; 