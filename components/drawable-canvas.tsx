"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { JSDOM } from 'jsdom';

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
      if (canvasRef.current) {
        const { width, height } = canvasRef.current;
        const pixelRatio = window.devicePixelRatio || 1;
        const canvasWidth = width / pixelRatio;
        const canvasHeight = height / pixelRatio;

        let templateElement = '';
        if (template && template.svgContent && template.viewBox) {
            const dom = new JSDOM(template.svgContent);
            const svgNode = dom.window.document.querySelector('svg');

            if (svgNode) {
              const tempViewBox = template.viewBox.split(' ').map(Number);
              const pathWidth = tempViewBox[2];
              const pathHeight = tempViewBox[3];

              const scale = Math.min(canvasWidth / pathWidth, canvasHeight / pathHeight) * 0.9;
              const offsetX = (canvasWidth - pathWidth * scale) / 2;
              const offsetY = (canvasHeight - pathHeight * scale) / 2;
              const strokeWidth = 2 / scale;
              
              const innerContent = Array.from(svgNode.children).map((child: Element) => {
                child.setAttribute('stroke', '#FF6338');
                child.setAttribute('stroke-width', strokeWidth.toString());
                child.setAttribute('fill', 'none');
                return child.outerHTML;
              }).join('');

              templateElement = `<g transform="translate(${offsetX} ${offsetY}) scale(${scale})">${innerContent}</g>`;
            }
        }

        const drawingContent = drawnPathsRef.current.map(pathD => 
          `<path d="${pathD}" stroke="black" stroke-width="2" fill="none" />`
        ).join('');
        
        const svgString = `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">${templateElement}${drawingContent}</svg>`;
        return svgString;
      }
      return "";
    },
    animateSvg(svgContent: string, viewBox: string | null, animated = true) {
      if (!context || !canvasRef.current) return;

      setTemplate({ svgContent, viewBox });

      const dom = new JSDOM(svgContent);
      const paths = Array.from(dom.window.document.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon'));

      if (!paths.length) return;

      const drawAllPaths = () => {
        if (!context || !canvasRef.current || !viewBox) return;
        const tempViewBox = viewBox.split(' ').map(Number);
        const pathWidth = tempViewBox[2];
        const pathHeight = tempViewBox[3];

        const scale = Math.min(canvasRef.current.offsetWidth / pathWidth, canvasRef.current.offsetHeight / pathHeight) * 0.9;
        const offsetX = (canvasRef.current.offsetWidth - pathWidth * scale) / 2;
        const offsetY = (canvasRef.current.offsetHeight - pathHeight * scale) / 2;

        context.save();
        context.translate(offsetX, offsetY);
        context.scale(scale, scale);
        
        context.strokeStyle = "#FF6338";
        context.lineWidth = 2 / scale;
        context.fillStyle = 'none';

        paths.forEach(p => {
            const path2d = new Path2D(p.getAttribute('d') || '');
            context.stroke(path2d);
        });

        context.restore();
      };

      if (!animated) {
        drawAllPaths();
        return;
      }

      // Animation logic can be added here if needed in the future
      drawAllPaths();
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
