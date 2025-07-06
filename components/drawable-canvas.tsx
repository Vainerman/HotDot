"use client";

import { useRef, useEffect, useState } from 'react';

const DrawableCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Set canvas dimensions for high-resolution displays
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    if (context) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const finishDrawing = () => {
    if (context) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      onMouseLeave={finishDrawing} // Stop drawing if mouse leaves canvas
      className="w-full h-full bg-white rounded-lg shadow-lg"
    />
  );
};

export default DrawableCanvas; 