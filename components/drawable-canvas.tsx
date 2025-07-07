"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export interface DrawableCanvasRef {
  clear: () => void;
  animateSvg: (pathData: string) => void;
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
    animateSvg(pathData: string) {
      if (!context) return;
      
      const path = new Path2D(pathData);
      const pathLength = 1000; // This is an approximation. A more accurate method is complex.
      let currentStep = 0;
      const stepSize = 20; // Controls drawing speed

      const animate = () => {
        if (currentStep > pathLength) return;

        // This is a simplified animation. For production, you'd use a more robust SVG path animation library.
        // @ts-ignore - setLineDash is not yet in the default TS DOM lib for Path2D
        context.setLineDash([currentStep, pathLength]);
        context.stroke(path);

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
