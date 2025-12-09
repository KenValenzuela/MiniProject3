import { useState, useRef, useCallback } from 'react';

/**
 * Pan and Zoom hook for map interaction
 */
export function usePanZoom({ minZoom = 0.5, maxZoom = 3.0, initialZoom = 1.0 }) {
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: initialZoom,
  });

  const isDraggingRef = useRef(false);
  const lastPanPointRef = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(minZoom, Math.min(maxZoom, transform.scale * delta));
    
    // Zoom centered on cursor position
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom point in map coordinates
    const zoomPointX = (mouseX - transform.x) / transform.scale;
    const zoomPointY = (mouseY - transform.y) / transform.scale;
    
    // Adjust pan to keep zoom point under cursor
    const newX = mouseX - zoomPointX * newScale;
    const newY = mouseY - zoomPointY * newScale;
    
    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  }, [transform, minZoom, maxZoom]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      isDraggingRef.current = true;
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastPanPointRef.current.x;
      const deltaY = e.clientY - lastPanPointRef.current.y;
      
      setTransform((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      
      lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: initialZoom });
  }, [initialZoom]);

  return {
    transform,
    setTransform,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetTransform,
  };
}

