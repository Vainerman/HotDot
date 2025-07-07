"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export interface DrawableCanvasRef {
  clear: () => void;
  drawSvg: (svgPath: string) => void;
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
    drawSvg(svgPath: string) {
      if (context && canvasRef.current) {
        console.log(`Attempting to load and draw SVG: ${svgPath}`);
        const img = new Image();
        img.src = svgPath;
        img.onload = () => {
          console.log(`SVG loaded successfully. Drawing on canvas: ${svgPath}`);
          context.drawImage(img, 0, 0, canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
        };
        img.onerror = () => {
          console.error(`Failed to load SVG image: ${svgPath}`);
        };
      }
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
      onMouseLeave={finishDrawing} // Stop drawing if mouse leaves canvas
      onTouchStart={startDrawing}
      onTouchEnd={finishDrawing}
      onTouchMove={draw}
      className="w-full h-full"
    />
  );
});

DrawableCanvas.displayName = "DrawableCanvas";
export default memo(DrawableCanvas);
