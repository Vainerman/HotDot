"use client";

import { useState, useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';

interface AnimatedSvgProps {
  svgUrl: string;
}

interface SvgPath {
  d: string;
  stroke: string;
  strokeWidth: string;
}

interface SvgGroup {
  type: 'g';
  transform: string | null;
  paths: SvgPath[];
}

interface SvgPathElement {
  type: 'path';
  path: SvgPath;
}

type SvgElement = SvgGroup | SvgPathElement;

const AnimatedSvg = ({ svgUrl }: AnimatedSvgProps) => {
  const [elements, setElements] = useState<SvgElement[]>([]);
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
        
        const parsedElements: SvgElement[] = [];
        const children = Array.from(svgDoc.documentElement.children);

        for (const child of children) {
          const tagName = child.tagName.toLowerCase();
          if (tagName === 'g') {
            const group: SvgGroup = {
              type: 'g',
              transform: child.getAttribute('transform'),
              paths: []
            };
            child.querySelectorAll('path').forEach(p => {
              group.paths.push({
                d: p.getAttribute('d') || '',
                stroke: p.getAttribute('stroke') || 'black',
                strokeWidth: p.getAttribute('stroke-width') || '2',
              });
            });
            parsedElements.push(group);
          } else if (tagName === 'path') {
            const pathElement: SvgPathElement = {
              type: 'path',
              path: {
                d: child.getAttribute('d') || '',
                stroke: child.getAttribute('stroke') || 'black',
                strokeWidth: child.getAttribute('stroke-width') || '2',
              }
            };
            parsedElements.push(pathElement);
          }
        }
        setElements(parsedElements);
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

  const variants: Variants = {
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

  if (!elements.length) {
    return <div className="w-full h-full bg-gray-200 animate-pulse" />;
  }

  let pathCounter = 0;

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox || undefined}
      className="w-full h-full cursor-pointer"
      onHoverStart={handleInteraction}
      onClick={handleInteraction}
    >
      {elements.map((el, i) => {
        if (el.type === 'g') {
          return (
            <motion.g key={`g-${i}`} transform={el.transform || undefined}>
              {el.paths.map((path, j) => (
                <motion.path
                  key={`p-${i}-${j}`}
                  d={path.d}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  fill="none"
                  custom={pathCounter++}
                  initial="visible"
                  animate={controls}
                  variants={variants}
                />
              ))}
            </motion.g>
          );
        } else { // path
          return (
            <motion.path
              key={`p-${i}`}
              d={el.path.d}
              stroke={el.path.stroke}
              strokeWidth={el.path.strokeWidth}
              fill="none"
              custom={pathCounter++}
              initial="visible"
              animate={controls}
              variants={variants}
            />
          );
        }
      })}
    </motion.svg>
  );
};

export default AnimatedSvg; 