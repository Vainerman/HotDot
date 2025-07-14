"use client";

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedSvgProps {
  svgUrl: string;
}

interface SvgPath {
  d: string;
  stroke: string;
  strokeWidth: string;
}

const AnimatedSvg = ({ svgUrl }: AnimatedSvgProps) => {
  const [paths, setPaths] = useState<SvgPath[]>([]);
  const [viewBox, setViewBox] = useState<string | null>('0 0 100 100');
  const controls = useAnimation();

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
        const pathData = Array.from(pathElements).map(p => ({
            d: p.getAttribute('d') || '',
            stroke: p.getAttribute('stroke') || 'black',
            strokeWidth: p.getAttribute('stroke-width') || '2',
        }));
        setPaths(pathData);
      } catch (error) {
        console.error('Failed to fetch or parse SVG:', error);
      }
    };

    if (svgUrl) {
      fetchAndParseSvg();
    }
  }, [svgUrl]);

  const handleInteraction = async () => {
    await controls.start("hidden");
    await controls.start("visible");
  };

  const variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.05, type: "spring", duration: 1, bounce: 0 },
        opacity: { delay: i * 0.05, duration: 0.01 }
      }
    })
  };

  if (!paths.length) {
    return <div className="w-full h-full bg-gray-200 animate-pulse" />;
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox || undefined}
      className="w-full h-full cursor-pointer"
      onHoverStart={handleInteraction}
      onClick={handleInteraction}
    >
      {paths.map((path, i) => (
        <motion.path
          key={i}
          d={path.d}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          fill="none"
          custom={i}
          initial="visible"
          animate={controls}
          variants={variants}
        />
      ))}
    </motion.svg>
  );
};

export default AnimatedSvg; 