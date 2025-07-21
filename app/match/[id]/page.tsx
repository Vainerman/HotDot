"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DrawableCanvas, { DrawableCanvasRef, DrawEvent } from '@/components/drawable-canvas';

export default function MatchPage() {
  const { id } = useParams();
  const search = useSearchParams();
  const role = search.get('role');
  const challengeId = search.get('challenge');
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!challengeId) return;
    fetch(`/api/challenge/${challengeId}`).then(res => res.json()).then(data => {
      if (data.template_svg && canvasRef.current) {
        canvasRef.current.animateSvg(data.template_svg, data.template_viewbox);
      }
    });
  }, [challengeId]);

  useEffect(() => {
    const channel = supabase.channel(`match-${id}`);
    if (role === 'creator') {
      channel.on('broadcast', { event: 'draw' }, payload => {
        if (canvasRef.current) {
          canvasRef.current.applyRemoteEvent(payload as DrawEvent);
        }
      });
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, role, supabase]);

  const handleDraw = (event: DrawEvent) => {
    if (role === 'guesser') {
      supabase.channel(`match-${id}`).send({ type: 'broadcast', event: 'draw', payload: event });
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-sm" style={{ aspectRatio: '346/562' }}>
        <DrawableCanvas ref={canvasRef} isLocked={role !== 'guesser'} onDrawEvent={handleDraw} />
      </div>
    </div>
  );
}
