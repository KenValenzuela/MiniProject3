/**
 * TimelineControls component for controlling animation playback
 * Provides slider, play/pause button, speed control, and timestamp display
 */
function TimelineControls({
  timestamps,
  currentIndex,
  playing,
  speed,
  onIndexChange,
  onPlayPause,
  onSpeedChange,
}) {
  // Format timestamp for display
  const formatTimestamp = (ts) => {
    if (!ts) return '--:--:--';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const currentTimestamp = timestamps[currentIndex] || null;

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      {/* Timestamp display */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
        {formatTimestamp(currentTimestamp)}
      </div>

      {/* Controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
        }}
      >
        {/* Play/Pause button */}
        <button
          onClick={onPlayPause}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: playing ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Speed dropdown */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Speed:</span>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            style={{
              padding: '4px 8px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1.0}>1x</option>
            <option value={2.0}>2x</option>
          </select>
        </label>

        {/* Frame counter */}
        <div style={{ fontSize: '14px', color: '#666' }}>
          Frame {currentIndex + 1} / {timestamps.length}
        </div>
      </div>

      {/* Slider */}
      <div style={{ width: '100%' }}>
        <input
          type="range"
          min={0}
          max={Math.max(0, timestamps.length - 1)}
          value={currentIndex}
          onChange={(e) => onIndexChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '4px',
          }}
        >
          <span>{formatTimestamp(timestamps[0])}</span>
          <span>{formatTimestamp(timestamps[timestamps.length - 1])}</span>
        </div>
      </div>
    </div>
  );
}

export default TimelineControls;

