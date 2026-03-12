
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { Pixel, GRID_SIZE } from '../types';

interface CanvasProps {
  pixels: Pixel[];
  onPixelClick?: (x: number, y: number) => void;
  highlightedOwner?: string | null;
  fullScreen?: boolean;
  targetPixel?: { x: number, y: number } | null;
}

export const Canvas: React.FC<CanvasProps> = ({ pixels, onPixelClick, highlightedOwner, fullScreen, targetPixel }) => {
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number, owner: string } | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  
  // Create a map for quick lookup
  const pixelMap = React.useMemo(() => {
    const map: Record<string, { color: string, owner: string, shape?: string }> = {};
    pixels.forEach((p) => {
      map[`${p.x}-${p.y}`] = { color: p.color, owner: p.ownerName, shape: p.shape };
    });
    return map;
  }, [pixels]);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const resetView = () => {
    setScale(1);
  };

  useEffect(() => {
    if (targetPixel && containerRef.current) {
      const gridElement = containerRef.current.querySelector('.grid');
      if (!gridElement) return;

      const { x: px, y: py } = targetPixel;
      
      const gridWidth = parseFloat(getComputedStyle(gridElement).width);
      const gridHeight = parseFloat(getComputedStyle(gridElement).height);
      
      const pixelX = (px / GRID_SIZE) * gridWidth;
      const pixelY = (py / GRID_SIZE) * gridHeight;
      
      // Offset from the center of the grid
      const offsetX = pixelX - gridWidth / 2;
      const offsetY = pixelY - gridHeight / 2;

      x.set(-offsetX);
      y.set(-offsetY);
      setScale(3);
    } else if (!targetPixel && !highlightedOwner) {
      // Reset to default view
      x.set(0);
      y.set(0);
      setScale(1);
    }
  }, [targetPixel, highlightedOwner, fullScreen]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
      }
    };

    let initialDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        
        if (initialDistance > 0) {
          const delta = (currentDistance - initialDistance) / 200;
          handleZoom(delta);
          initialDistance = currentDistance;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative ${fullScreen ? 'w-full h-full flex items-center justify-center' : 'aspect-square w-full max-w-2xl mx-auto rounded-lg shadow-2xl'} bg-zinc-100 border border-zinc-200 overflow-hidden group cursor-grab active:cursor-grabbing`}
    >
      <motion.div 
        drag
        dragMomentum={false}
        style={{ 
          x: springX,
          y: springY,
          scale,
          width: fullScreen ? 'min(90vw, 90vh)' : '100%',
          height: fullScreen ? 'min(90vw, 90vh)' : '100%',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
        className="grid bg-white shadow-2xl origin-center" 
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const pixelData = pixelMap[`${x}-${y}`];
          const color = pixelData?.color || 'transparent';
          const owner = pixelData?.owner || '';
          const shape = pixelData?.shape || 'square';
          
          const isHighlighted = highlightedOwner && owner.toLowerCase().includes(highlightedOwner.toLowerCase());
          const hasOwner = owner !== '';
          
          // Stable pseudo-random values based on coordinates
          const pulseDelay = (x * 0.5 + y * 0.7) % 4;
          const pulseDuration = 3 + ((x * 0.2 + y * 0.3) % 2);

          const getShapeStyles = (shape: string) => {
            switch (shape) {
              case 'circle': return 'rounded-full';
              case 'diamond': return 'rotate-45 scale-75';
              case 'triangle': return 'clip-triangle';
              default: return '';
            }
          };

          return (
            <motion.div
              key={`${x}-${y}`}
              initial={false}
              animate={{ 
                backgroundColor: color,
                scale: isHighlighted 
                  ? [1.2, 1.4, 1.2] 
                  : (hasOwner ? [1, 1.03, 1] : 1),
                zIndex: isHighlighted ? 20 : 0,
                boxShadow: isHighlighted 
                  ? [
                      '0 0 10px rgba(255, 107, 0, 0.5)',
                      '0 0 20px rgba(255, 107, 0, 0.9)',
                      '0 0 10px rgba(255, 107, 0, 0.5)'
                    ] 
                  : 'none'
              }}
              transition={isHighlighted ? {
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                backgroundColor: { duration: 0.2 }
              } : (hasOwner ? {
                scale: { 
                  repeat: Infinity, 
                  duration: pulseDuration, 
                  ease: "easeInOut",
                  delay: pulseDelay
                },
                backgroundColor: { duration: 0.2 }
              } : { duration: 0.2 })}
              className={`border-[0.5px] border-zinc-100/50 cursor-pointer transition-all ${getShapeStyles(shape)} ${isHighlighted ? 'ring-2 ring-brand ring-offset-1' : 'hover:bg-zinc-50'}`}
              onClick={() => onPixelClick?.(x, y)}
              onMouseEnter={() => owner && setHoveredPixel({ x, y, owner })}
              onMouseLeave={() => setHoveredPixel(null)}
              whileHover={hasOwner ? { 
                scale: 1.2, 
                zIndex: 10,
                filter: 'brightness(1.2)',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)'
              } : {}}
            />
          );
        })}

        <AnimatePresence>
          {(hoveredPixel || (highlightedOwner && pixels.find(p => p.ownerName.toLowerCase() === highlightedOwner.toLowerCase()))) && (
            <motion.div
              key={hoveredPixel ? `tooltip-${hoveredPixel.x}-${hoveredPixel.y}` : `tooltip-${highlightedOwner}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute pointer-events-none bg-brand text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl z-50 whitespace-nowrap"
              style={{
                left: hoveredPixel 
                  ? `${(hoveredPixel.x / GRID_SIZE) * 100}%`
                  : `${(pixels.find(p => p.ownerName.toLowerCase() === highlightedOwner?.toLowerCase())?.x || 0) / GRID_SIZE * 100}%`,
                top: hoveredPixel
                  ? `${(hoveredPixel.y / GRID_SIZE) * 100}%`
                  : `${(pixels.find(p => p.ownerName.toLowerCase() === highlightedOwner?.toLowerCase())?.y || 0) / GRID_SIZE * 100}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              {hoveredPixel ? hoveredPixel.owner : highlightedOwner}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
