import { useState } from 'react';
import { exportAnimationFrames, exportAsMP4, exportAsGIF } from '../utils/exportAnimation';

/**
 * ExportButton component - handles animation export
 */
function ExportButton({ timestamps, onFrameLoad, isPlaying, onPlayPause }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async (format = 'mp4') => {
    if (!timestamps || timestamps.length === 0) {
      alert('No animation data to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Pause animation during export
    const wasPlaying = isPlaying;
    if (wasPlaying && onPlayPause) {
      onPlayPause();
    }

    try {
      // Disable pan/zoom during export (would need to be passed as prop)
      // Capture all frames
      const frames = await exportAnimationFrames(
        timestamps,
        onFrameLoad,
        (current, total) => {
          setExportProgress((current / total) * 100);
        }
      );

      let downloadUrl;
      if (format === 'mp4') {
        downloadUrl = await exportAsMP4(frames, 2);
      } else {
        downloadUrl = await exportAsGIF(frames, 500);
      }

      // Trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ride-hailing-animation.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      
      // Resume playback if it was playing
      if (wasPlaying && onPlayPause) {
        onPlayPause();
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <button
        onClick={() => handleExport('mp4')}
        disabled={isExporting || !timestamps || timestamps.length === 0}
        style={{
          padding: '8px 16px',
          margin: '0 5px',
          fontSize: '14px',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          opacity: isExporting ? 0.6 : 1,
        }}
      >
        {isExporting ? `Exporting... ${Math.round(exportProgress)}%` : 'Export Animation (MP4)'}
      </button>
      <button
        onClick={() => handleExport('gif')}
        disabled={isExporting || !timestamps || timestamps.length === 0}
        style={{
          padding: '8px 16px',
          margin: '0 5px',
          fontSize: '14px',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          opacity: isExporting ? 0.6 : 1,
        }}
      >
        {isExporting ? `Exporting... ${Math.round(exportProgress)}%` : 'Export Animation (GIF)'}
      </button>
      {isExporting && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Progress: {Math.round(exportProgress)}%
        </div>
      )}
    </div>
  );
}

export default ExportButton;

