"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export interface DrawableCanvasRef {
  clear: () => void;
  animateSvg: (pathData: string, viewBox: string | null) => void;
  getSvg: () => string;
}

interface DrawableCanvasProps {
  isLocked?: boolean;
}

const DrawableCanvas = forwardRef<DrawableCanvasRef, DrawableCanvasProps>(({ isLocked = false }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [template, setTemplate] = useState<{ pathData: string, viewBox: string | null } | null>(null);

  useImperativeHandle(ref, () => ({
    clear() {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (template) {
          this.animateSvg(template.pathData, template.viewBox, false); // Redraw without animation
        }
      }
    },
    getSvg() {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL();
      }
      return "";
    },
    animateSvg(pathData: string, viewBox: string | null, shouldAnimate = true) {
      if (!context || !canvasRef.current || !viewBox) return;

      if(shouldAnimate) {
        setTemplate({ pathData, viewBox });
      }

      const path = new Path2D(pathData);
      
      const viewboxParts = viewBox.split(' ').map(parseFloat);
      const [,, vbWidth, vbHeight] = viewboxParts;

      const canvasWidth = canvasRef.current.offsetWidth;
      const canvasHeight = canvasRef.current.offsetHeight;
      
      const scale = Math.min(canvasWidth / vbWidth, canvasHeight / vbHeight) * 0.5;
      const offsetX = (canvasWidth - (vbWidth * scale)) / 2;
      const offsetY = (canvasHeight - (vbHeight * scale)) / 4;

      const drawPath = (dashOffset: number = 0) => {
        context.save();
        context.strokeStyle = '#FF5C38';
        context.lineWidth = 3;
        if(dashOffset > 0) context.setLineDash([dashOffset, 2000]);
        context.translate(offsetX, offsetY);
        context.scale(scale, scale);
        context.stroke(path);
        context.restore();
      }

      if (!shouldAnimate) {
        drawPath();
        return;
      }

      let currentStep = 0;
      const stepSize = 10;
      const pathLength = 2000;

      const animate = () => {
        if (currentStep > pathLength) {
          context.setLineDash([]);
          return;
        }
        
        drawPath(currentStep)
        currentStep += stepSize;
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    },
  }));

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
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
      context.beginPath();
      context.moveTo(offsetX, offsetY);
    }
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
    if(context) context.closePath();
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !lastPointRef.current || isLocked) {
      return;
    }
    const { offsetX, offsetY } = getCoordinates(event);
    
    const midPointX = (lastPointRef.current.x + offsetX) / 2;
    const midPointY = (lastPointRef.current.y + offsetY) / 2;
    
    context.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midPointX, midPointY);
    context.lineTo(offsetX, offsetY);
    context.stroke();

    lastPointRef.current = { x: offsetX, y: offsetY };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={!isLocked ? startDrawing : undefined}
      onMouseUp={!isLocked ? finishDrawing : undefined}
      onMouseMove={!isLocked ? draw : undefined}
      onMouseLeave={!isLocked ? finishDrawing : undefined}
      onTouchStart={!isLocked ? startDrawing : undefined}
      onTouchEnd={!isLocked ? finishDrawing : undefined}
      onTouchMove={!isLocked ? draw : undefined}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
});

DrawableCanvas.displayName = "DrawableCanvas";
export default memo(DrawableCanvas);
