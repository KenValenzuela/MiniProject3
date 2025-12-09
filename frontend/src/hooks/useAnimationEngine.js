import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Advanced animation engine using requestAnimationFrame
 * Provides smooth frame-by-frame playback with speed control
 */
export function useAnimationEngine({
  totalFrames,
  onFrameChange,
  initialFrameIndex = 0,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(initialFrameIndex);
  
  const lastFrameTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const baseFrameDuration = 500; // Base duration in ms per frame

  // Animation loop using requestAnimationFrame
  const animate = useCallback((currentTime) => {
    if (!isPlaying) {
      lastFrameTimeRef.current = null;
      return;
    }

    if (lastFrameTimeRef.current === null) {
      lastFrameTimeRef.current = currentTime;
    }

    const elapsed = currentTime - lastFrameTimeRef.current;
    const frameDuration = baseFrameDuration / playbackSpeed;

    if (elapsed >= frameDuration) {
      setCurrentFrameIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % totalFrames;
        onFrameChange(nextIndex);
        return nextIndex;
      });
      lastFrameTimeRef.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, playbackSpeed, totalFrames, onFrameChange]);

  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying && totalFrames > 0) {
      lastFrameTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastFrameTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animate, totalFrames]);

  const startPlayback = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const setPlaybackSpeedValue = useCallback((speed) => {
    setPlaybackSpeed(Math.max(0.25, Math.min(4.0, speed)));
  }, []);

  const jumpToFrame = useCallback((frameIndex) => {
    const clampedIndex = Math.max(0, Math.min(totalFrames - 1, frameIndex));
    setCurrentFrameIndex(clampedIndex);
    onFrameChange(clampedIndex);
    lastFrameTimeRef.current = null; // Reset timing
  }, [totalFrames, onFrameChange]);

  return {
    isPlaying,
    playbackSpeed,
    currentFrameIndex,
    startPlayback,
    stopPlayback,
    setPlaybackSpeed: setPlaybackSpeedValue,
    jumpToFrame,
  };
}

