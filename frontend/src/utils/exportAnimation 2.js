/**
 * Export animation utility
 * Captures frames and exports as video/GIF
 */

const MAP_WIDTH = 1551;
const MAP_HEIGHT = 1171;

/**
 * Capture a single frame from the map canvas
 */
export async function captureFrame() {
  const mapWrapper = document.getElementById('map-wrapper');
  if (!mapWrapper) return null;

  // Create a canvas to capture the frame
  const canvas = document.createElement('canvas');
  canvas.width = MAP_WIDTH;
  canvas.height = MAP_HEIGHT;
  const ctx = canvas.getContext('2d');

  // Use html2canvas or similar library would be ideal
  // For now, we'll use a simpler approach with canvas drawing
  // This is a placeholder - in production, use html2canvas library
  
  // Draw map background
  const mapImg = new Image();
  mapImg.crossOrigin = 'anonymous';
  mapImg.src = '/map.png';
  
  return new Promise((resolve) => {
    mapImg.onload = () => {
      ctx.drawImage(mapImg, 0, 0, MAP_WIDTH, MAP_HEIGHT);
      resolve(canvas);
    };
    mapImg.onerror = () => resolve(null);
  });
}

/**
 * Export animation as frames (for backend processing or client-side encoding)
 */
export async function exportAnimationFrames(timestamps, onFrameLoad, onProgress) {
  const frames = [];
  const totalFrames = timestamps.length;

  for (let i = 0; i < totalFrames; i++) {
    // Load frame data
    await onFrameLoad(timestamps[i], i);
    
    // Wait for frame to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Capture frame
    const canvas = await captureFrame();
    if (canvas) {
      frames.push(canvas);
    }
    
    if (onProgress) {
      onProgress(i + 1, totalFrames);
    }
  }

  return frames;
}

/**
 * Convert frames to video (MP4) using MediaRecorder API
 * Note: This is a simplified version. For production, consider using ffmpeg.js
 */
export async function exportAsMP4(frames, fps = 2) {
  // This is a placeholder - actual implementation would require:
  // 1. Converting canvas frames to video chunks
  // 2. Using MediaRecorder or ffmpeg.js
  // 3. Creating a blob and downloading
  
  console.log(`Exporting ${frames.length} frames as MP4 at ${fps} fps`);
  
  // Placeholder: return a promise that would create the video
  return new Promise((resolve) => {
    // In production, implement actual video encoding here
    setTimeout(() => {
      const blob = new Blob(['Video export placeholder'], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 1000);
  });
}

/**
 * Convert frames to GIF
 * Note: This requires a GIF encoding library like gif.js
 */
export async function exportAsGIF(frames, delay = 500) {
  console.log(`Exporting ${frames.length} frames as GIF with ${delay}ms delay`);
  
  // Placeholder: return a promise that would create the GIF
  return new Promise((resolve) => {
    // In production, use gif.js or similar library
    setTimeout(() => {
      const blob = new Blob(['GIF export placeholder'], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 1000);
  });
}

