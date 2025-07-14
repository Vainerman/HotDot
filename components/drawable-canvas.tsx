"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export interface DrawableCanvasRef {
  clear: (redrawTemplate?: boolean) => void;
  getDrawingAsSvg: () => string;
  animateSvg: (pathData: string, viewBox: string | null, animated?: boolean) => void;
}

interface DrawableCanvasProps {
  isLocked?: boolean;
}

const DrawableCanvas = forwardRef<DrawableCanvasRef, DrawableCanvasProps>(({ isLocked = false }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnPathsRef = useRef<string[]>([]);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [template, setTemplate] = useState<{ pathData: string, viewBox: string | null } | null>(null);

  useImperativeHandle(ref, () => ({
    clear(redrawTemplate = true) {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawnPathsRef.current = []; // Clear drawn paths
        if (template && redrawTemplate) {
          this.animateSvg(template.pathData, template.viewBox, false); // Redraw without animation
        }
      }
    },
    getDrawingAsSvg() {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current;
        const pixelRatio = window.devicePixelRatio || 1;
        
        const templatePath = template ? `<path d="${template.pathData}" stroke="#FF6338" stroke-width="2" fill="none" />` : '';

        const drawingContent = drawnPathsRef.current.map(pathD => 
          `<path d="${pathD}" stroke="black" stroke-width="2" fill="none" />`
        ).join('');
        
        const svgString = `<svg width="${width / pixelRatio}" height="${height / pixelRatio}" viewBox="0 0 ${width / pixelRatio} ${height / pixelRatio}" xmlns="http://www.w3.org/2000/svg">${templatePath}${drawingContent}</svg>`;
        return svgString;
      }
      return "";
    },
    animateSvg(pathData: string, viewBox: string | null, animated = true) {
      if (!context || !canvasRef.current) return;

      setTemplate({ pathData, viewBox });

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

      if (!animated) {
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
      // Start a new path string
      drawnPathsRef.current.push(`M${offsetX},${offsetY}`);
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
    
    // For SVG path
    if (drawnPathsRef.current.length > 0) {
      const lastPath = drawnPathsRef.current[drawnPathsRef.current.length - 1];
      const midPointX = (lastPointRef.current.x + offsetX) / 2;
      const midPointY = (lastPointRef.current.y + offsetY) / 2;
      // Append quadratic curve and line segments to the current path string
      drawnPathsRef.current[drawnPathsRef.current.length - 1] = `${lastPath} Q${lastPointRef.current.x},${lastPointRef.current.y} ${midPointX},${midPointY} L${offsetX},${offsetY}`;
    }

    // For canvas rendering
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
