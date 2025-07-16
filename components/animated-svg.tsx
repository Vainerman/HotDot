"use client";

import { useState, useEffect } from 'react';

interface AnimatedSvgProps {
  svgUrl: string;
}

const AnimatedSvg = ({ svgUrl }: AnimatedSvgProps) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(svgUrl);
        const text = await response.text();
        setSvgContent(text);
      } catch (error) {
        console.error('Failed to fetch SVG:', error);
      }
    };

    if (svgUrl) {
      fetchSvg();
    }
  }, [svgUrl]);

  if (!svgContent) {
    return <div className="w-full h-full bg-gray-200 animate-pulse" />;
  }

  return (
    <div
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default AnimatedSvg; 