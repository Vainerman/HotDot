"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export type Point = { x: number; y: number };
export type DrawEvent = { type: 'start' | 'move' | 'end'; x: number; y: number };

export interface DrawableCanvasRef {
  clear: (redrawTemplate?: boolean) => void;
  getDrawingAsSvg: () => string;
  animateSvg: (svgContent: string, viewBox: string | null, animated?: boolean) => void;
  applyRemoteEvent: (event: DrawEvent) => void;
  drawRemote: (points: Point[]) => void;
}

interface DrawableCanvasProps {
  isLocked?: boolean;
  onDrawEvent?: (event: DrawEvent) => void;
  onDraw?: (points: Point[]) => void;
}

const DrawableCanvas = forwardRef<DrawableCanvasRef, DrawableCanvasProps>(({ isLocked = false, onDrawEvent, onDraw }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnPathsRef = useRef<string[]>([]);
  const currentPath = useRef<Point[]>([]);
  const lastPointRef = useRef<{ x: number, y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [template, setTemplate] = useState<{ svgContent: string, viewBox: string | null } | null>(null);
  const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });

  useImperativeHandle(ref, () => ({
    clear(redrawTemplate = true) {
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawnPathsRef.current = []; // Clear drawn paths
        if (template && redrawTemplate) {
          this.animateSvg(template.svgContent, template.viewBox, false); // Redraw without animation
        }
      }
    },
    getDrawingAsSvg() {
      if (!canvasRef.current) return "";

      const pixelRatio = window.devicePixelRatio || 1;
      const canvasWidth = canvasRef.current.width / pixelRatio;
      const canvasHeight = canvasRef.current.height / pixelRatio;

      let templateGroup = '';
      if (template && template.svgContent) {
          const { scale, offsetX, offsetY } = transformRef.current;
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(template.svgContent, 'image/svg+xml');
          const templateNode = svgDoc.querySelector('svg');

          if(templateNode) {
              const innerContent = templateNode.innerHTML;
              templateGroup = `<g transform="translate(${offsetX} ${offsetY}) scale(${scale})">${innerContent}</g>`;
          }
      }

      const userDrawingContent = drawnPathsRef.current.map(pathD => 
          `<path d="${pathD}" stroke="black" stroke-width="2" fill="none" />`
      ).join('');

      // Check if there's actually any drawing content
      if (drawnPathsRef.current.length === 0 && !templateGroup) {
          return ""; // Return empty string to indicate no drawing content
      }

      return `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">${templateGroup}${userDrawingContent}</svg>`;
    },
    animateSvg(svgContent: string, viewBox: string | null, animated = true) {
      if (!context || !canvasRef.current || !viewBox) return;

      setTemplate({ svgContent, viewBox });

      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (!context || !canvasRef.current) return;
        
        const tempViewBox = viewBox.split(' ').map(Number);
        const pathWidth = tempViewBox[2];
        const pathHeight = tempViewBox[3];

        const canvasWidth = canvasRef.current.offsetWidth;
        const canvasHeight = canvasRef.current.offsetHeight;

        const scale = Math.min(canvasWidth / pathWidth, canvasHeight / pathHeight) * 0.45;
        const offsetX = (canvasWidth - pathWidth * scale) / 2;
        const offsetY = (canvasHeight - pathHeight * scale) / 2;
        
        transformRef.current = { scale, offsetX, offsetY };
        
        // Before drawing, we'll apply a global filter to color the image orange.
        context.save();
        context.filter = 'opacity(0.5) drop-shadow(0 0 0 #FF6338)';
        context.drawImage(img, offsetX, offsetY, pathWidth * scale, pathHeight * scale);
        context.restore();

        URL.revokeObjectURL(url);
      };

      img.src = url;
    },
    applyRemoteEvent(event: DrawEvent) {
      if (event.type === 'start') startAt(event.x, event.y);
      else if (event.type === 'move') drawAt(event.x, event.y);
      else if (event.type === 'end') finishInternal();
    },
    drawRemote(points: Point[]) {
        if (!context || points.length === 0) return;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.stroke();
    }
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
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event.nativeEvent) {
      event.preventDefault();
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startAt = (x: number, y: number) => {
    if (context) {
      setIsDrawing(true);
      lastPointRef.current = { x, y };
      currentPath.current = [{x, y}];
      context.beginPath();
      context.moveTo(x, y);
      drawnPathsRef.current.push(`M${x.toFixed(2)},${y.toFixed(2)}`);
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(event);
    startAt(x, y);
    onDrawEvent?.({ type: 'start', x, y });
  };

  const finishInternal = () => {
    if (isDrawing && context && lastPointRef.current) {
      context.lineTo(lastPointRef.current.x, lastPointRef.current.y);
      context.stroke();
      if (drawnPathsRef.current.length > 0) {
        const lastPath = drawnPathsRef.current[drawnPathsRef.current.length - 1];
        drawnPathsRef.current[drawnPathsRef.current.length - 1] = `${lastPath} L${lastPointRef.current.x.toFixed(2)},${lastPointRef.current.y.toFixed(2)}`;
      }
    }
    if (onDraw && currentPath.current.length > 0) {
        onDraw(currentPath.current);
    }
    currentPath.current = [];
    setIsDrawing(false);
    lastPointRef.current = null;
    if (context) context.closePath();
  };

  const finishDrawing = () => {
    finishInternal();
    onDrawEvent?.({ type: 'end', x: 0, y: 0 });
  };

  const drawAt = (x: number, y: number) => {
    if (!isDrawing || !context || !lastPointRef.current) return;

    const midPointX = (lastPointRef.current.x + x) / 2;
    const midPointY = (lastPointRef.current.y + y) / 2;

    context.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midPointX, midPointY);
    context.stroke();
    currentPath.current.push({x, y});

    if (drawnPathsRef.current.length > 0) {
      const lastPath = drawnPathsRef.current[drawnPathsRef.current.length - 1];
      drawnPathsRef.current[drawnPathsRef.current.length - 1] = `${lastPath} Q${lastPointRef.current.x.toFixed(2)},${lastPointRef.current.y.toFixed(2)} ${midPointX.toFixed(2)},${midPointY.toFixed(2)}`;
    }

    lastPointRef.current = { x, y };
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(event);
    drawAt(x, y);
    onDrawEvent?.({ type: 'move', x, y });
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
