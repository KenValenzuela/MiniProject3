import { useRef, useEffect } from 'react';

const MAP_WIDTH = 1551;
const MAP_HEIGHT = 1171;
const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;

/**
 * MiniMap component - shows overview map with viewport rectangle
 */
function MiniMap({ transform, frameData, onMinimapClick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate viewport rectangle in minimap coordinates
  const getViewportRect = () => {
    const scaleX = MINIMAP_WIDTH / MAP_WIDTH;
    const scaleY = MINIMAP_HEIGHT / MAP_HEIGHT;
    
    // Calculate visible area based on transform
    const viewportWidth = (MAP_WIDTH / transform.scale) * scaleX;
    const viewportHeight = (MAP_HEIGHT / transform.scale) * scaleY;
    
    // Calculate position (accounting for pan)
    const viewportX = (-transform.x / transform.scale) * scaleX;
    const viewportY = (-transform.y / transform.scale) * scaleY;
    
    return {
      x: Math.max(0, Math.min(MINIMAP_WIDTH - viewportWidth, viewportX)),
      y: Math.max(0, Math.min(MINIMAP_HEIGHT - viewportHeight, viewportY)),
      width: viewportWidth,
      height: viewportHeight,
    };
  };

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw map background (scaled)
    const mapImg = new Image();
    mapImg.src = '/map.png';
    mapImg.onload = () => {
      ctx.drawImage(mapImg, 0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

      // Draw cars as dots
      if (frameData) {
        const scaleX = MINIMAP_WIDTH / MAP_WIDTH;
        const scaleY = MINIMAP_HEIGHT / MAP_HEIGHT;
        
        frameData.forEach((slot) => {
          if (slot.occupied) {
            ctx.fillStyle = '#1a73e8';
            ctx.beginPath();
            ctx.arc(
              slot.x * scaleX,
              slot.y * scaleY,
              2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        });
      }

      // Draw viewport rectangle
      const viewport = getViewportRect();
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height);
    };
  }, [transform, frameData]);

  const handleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert minimap coordinates to map coordinates
    const mapX = (x / MINIMAP_WIDTH) * MAP_WIDTH;
    const mapY = (y / MINIMAP_HEIGHT) * MAP_HEIGHT;
    
    // Center viewport on clicked point
    if (onMinimapClick) {
      onMinimapClick(mapX, mapY);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: `${MINIMAP_WIDTH}px`,
        height: `${MINIMAP_HEIGHT}px`,
        border: '2px solid #333',
        backgroundColor: '#000',
        cursor: 'pointer',
        zIndex: 1000,
      }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default MiniMap;

