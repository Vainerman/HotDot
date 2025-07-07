"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export interface DrawableCanvasRef {
  clear: () => void;
  animateSvg: (pathData: string, viewBox: string | null) => void;
}

const DrawableCanvas = forwardRef<DrawableCanvasRef, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useImperativeHandle(ref, () => ({
    clear() {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    },
    animateSvg(pathData: string, viewBox: string | null) {
      if (!context || !canvasRef.current || !viewBox) return;

      const path = new Path2D(pathData);
      const pathLength = 2000; // Increased for a longer, smoother animation
      let currentStep = 0;
      const stepSize = 10; // Decreased for smaller, smoother steps

      const viewboxParts = viewBox.split(' ').map(parseFloat);
      const [,, vbWidth, vbHeight] = viewboxParts;

      const canvasWidth = canvasRef.current.offsetWidth;
      const canvasHeight = canvasRef.current.offsetHeight;
      
      const scale = Math.min(canvasWidth / vbWidth, canvasHeight / vbHeight) * 0.5; // Scale to 50% of fit
      const offsetX = (canvasWidth - (vbWidth * scale)) / 2;
      const offsetY = (canvasHeight - (vbHeight * scale)) / 4; // Positioned a bit higher

      const animate = () => {
        if (currentStep > pathLength) {
          context.setLineDash([]); // Clear dash effect
          return;
        }
        
        context.save();
        context.strokeStyle = 'orange';
        context.lineWidth = 3; // Slightly thicker for visibility
        context.setLineDash([currentStep, pathLength]);
        context.translate(offsetX, offsetY);
        context.scale(scale, scale);
        context.stroke(path);
        context.restore();

        currentStep += stepSize;
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    },
  }));

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
        ctx.lineJoin = 'round'; // For smoother line joins
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2; // Thinner pen
        ctx.globalCompositeOperation = 'destination-over';
        setContext(ctx);
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (event.nativeEvent instanceof MouseEvent) {
      return { offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY };
    }
    event.preventDefault();
    const touch = (event.nativeEvent as TouchEvent).touches[0];
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = getCoordinates(event);
    if (context) {
      setIsDrawing(true);
      lastPointRef.current = { x: offsetX, y: offsetY };
    }
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !lastPointRef.current) {
      return;
    }
    const { offsetX, offsetY } = getCoordinates(event);
    
    const midPointX = (lastPointRef.current.x + offsetX) / 2;
    const midPointY = (lastPointRef.current.y + offsetY) / 2;
    
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midPointX, midPointY);
    context.lineTo(offsetX, offsetY);
    context.stroke();
    context.closePath();

    lastPointRef.current = { x: offsetX, y: offsetY };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      onMouseLeave={finishDrawing}
      onTouchStart={startDrawing}
      onTouchEnd={finishDrawing}
      onTouchMove={draw}
      className="w-full h-full"
    />
  );
});

DrawableCanvas.displayName = "DrawableCanvas";
export default memo(DrawableCanvas);
