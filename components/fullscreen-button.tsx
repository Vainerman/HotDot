'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Maximize } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FullscreenButton() {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <Button
      onClick={handleFullscreen}
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 z-50"
    >
      <Maximize className="h-4 w-4" />
    </Button>
  );
} 