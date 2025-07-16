"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';

export interface DrawableCanvasRef {
  clear: (redrawTemplate?: boolean) => void;
  getDrawingAsSvg: () => string;
  animateSvg: (svgContent: string, viewBox: string | null, animated?: boolean) => void;
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
      if (!template || !template.svgContent) return "";
      
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(template.svgContent, 'image/svg+xml');
      const svgNode = svgDoc.querySelector('svg');

      if (!svgNode) return "";
      
      const { scale } = transformRef.current;
      const strokeWidth = 2 / scale;

      const drawingContent = drawnPathsRef.current.map(pathD => 
        `<path d="${pathD}" stroke="black" stroke-width="${strokeWidth}" fill="none" />`
      ).join('');

      // Add the user's drawing to the template SVG
      svgNode.innerHTML += drawingContent;
      
      // Ensure the template's strokes are also correctly sized
      svgNode.querySelectorAll('*').forEach((el: Element) => {
        if (el.hasAttribute('stroke')) {
            el.setAttribute('stroke-width', strokeWidth.toString());
        }
      });
      
      return svgNode.outerHTML;
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

        const scale = Math.min(canvasWidth / pathWidth, canvasHeight / pathHeight) * 0.9;
        const offsetX = (canvasWidth - pathWidth * scale) / 2;
        const offsetY = (canvasHeight - pathHeight * scale) / 2;
        
        // Before drawing, we'll apply a global filter to color the image orange
        context.save();
        context.filter = 'opacity(0.5) drop-shadow(0 0 0 #FF6338)';
        context.drawImage(img, offsetX, offsetY, pathWidth * scale, pathHeight * scale);
        context.restore();

        URL.revokeObjectURL(url);
      };

      img.src = url;
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

  const getTransformedCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { scale, offsetX, offsetY } = transformRef.current;
    
    let clientX, clientY;
    if ('touches' in event.nativeEvent) {
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    }
    
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const transformedX = (canvasX - offsetX) / scale;
    const transformedY = (canvasY - offsetY) / scale;
    
    return { x: transformedX, y: transformedY, rawX: canvasX, rawY: canvasY };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y, rawX, rawY } = getTransformedCoordinates(event);
    if (context) {
      setIsDrawing(true);
      lastPointRef.current = { x: rawX, y: rawY };
      context.beginPath();
      context.moveTo(rawX, rawY);
      drawnPathsRef.current.push(`M${x},${y}`);
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
    const { x, y, rawX, rawY } = getTransformedCoordinates(event);
    
    if (drawnPathsRef.current.length > 0) {
      const lastPath = drawnPathsRef.current[drawnPathsRef.current.length - 1];
      const { x: lastTransformedX, y: lastTransformedY } = { 
        x: (lastPointRef.current.x - transformRef.current.offsetX) / transformRef.current.scale,
        y: (lastPointRef.current.y - transformRef.current.offsetY) / transformRef.current.scale
      };
      const midX = (lastTransformedX + x) / 2;
      const midY = (lastTransformedY + y) / 2;
      drawnPathsRef.current[drawnPathsRef.current.length - 1] = `${lastPath} Q${lastTransformedX},${lastTransformedY} ${midX},${midY} L${x},${y}`;
    }

    const midRawX = (lastPointRef.current.x + rawX) / 2;
    const midRawY = (lastPointRef.current.y + rawY) / 2;
    
    context.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midRawX, midRawY);
    context.lineTo(rawX, rawY);
    context.stroke();

    lastPointRef.current = { x: rawX, y: rawY };
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
