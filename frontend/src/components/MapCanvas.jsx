import { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react';
import { useRideHailingStore } from '../state/useRideHailingStore.jsx';
import CarSprite from './CarSprite';
import TimelineControls from './TimelineControls';
import { useAnimationEngine } from '../hooks/useAnimationEngine';
import CarTooltip from './CarTooltip';
import ExportButton from './ExportButton';
import { createSlotMapping, getDisplaySlotId } from '../utils/slotMapping';

/**
 * MapCanvas component for rendering the map with slot grid and car animation
 * Uses exact backend coordinates without any scaling or transformation
 */
function MapCanvas() {
  const {
    timestamps,
    frameData,
    stats,
    selectedTimestamp,
    loadingTimestamps,
    loadingFrame,
    loadingStats,
    loadTimestamps,
    loadFrame,
    loadStats,
    setSelectedTimestamp,
  } = useRideHailingStore();

  // Fixed map dimensions
  const MAP_WIDTH = 1551;
  const MAP_HEIGHT = 1171;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [displayFrameData, setDisplayFrameData] = useState([]);
  const [mapScale, setMapScale] = useState(1);
  const mapContainerRef = useRef(null);
  const slotMappingRef = useRef(new Map());
  
  // Cache for last known stats - persists across frame changes
  const cachedStatsRef = useRef(null);
  
  // Create slot mapping once when we have frame data (stable across frames)
  useEffect(() => {
    if (frameData.length > 0 && slotMappingRef.current.size === 0) {
      // Create mapping based on first frame's slot positions
      slotMappingRef.current = createSlotMapping(frameData);
      console.log('Slot mapping created:', Array.from(slotMappingRef.current.entries()));
    }
  }, [frameData]);

  // Advanced animation engine
  const handleFrameChange = useRef((index) => {
    if (timestamps.length > 0 && index < timestamps.length && !loadingFrame) {
      loadFrame(timestamps[index]);
    }
  });

  const animationEngine = useAnimationEngine({
    totalFrames: timestamps.length,
    onFrameChange: (index) => {
      // Debounce rapid frame changes
      if (!loadingFrame) {
        handleFrameChange.current(index);
      }
    },
    initialFrameIndex: 0,
  });

  const { isPlaying, playbackSpeed, currentFrameIndex, startPlayback, stopPlayback, setPlaybackSpeed, jumpToFrame } = animationEngine;

  // Load timestamps on mount
  useEffect(() => {
    loadTimestamps();
  }, [loadTimestamps]);

  // Handle map image load
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // Update frame change handler when timestamps change
  const lastRequestedFrameRef = useRef(null);
  useEffect(() => {
    handleFrameChange.current = (index) => {
      if (timestamps.length > 0 && index < timestamps.length && !loadingFrame) {
        // Prevent requesting the same frame multiple times
        if (lastRequestedFrameRef.current !== index) {
          lastRequestedFrameRef.current = index;
          loadFrame(timestamps[index]);
        }
      }
    };
  }, [timestamps, loadFrame, loadingFrame]);

  // Load first frame when timestamps are available (only once)
  const hasLoadedInitialFrame = useRef(false);
  useEffect(() => {
    if (timestamps.length > 0 && !loadingTimestamps && mapLoaded && !hasLoadedInitialFrame.current) {
      hasLoadedInitialFrame.current = true;
      jumpToFrame(0);
      // loadFrame will be called by jumpToFrame -> onFrameChange
    }
  }, [timestamps, loadingTimestamps, mapLoaded, jumpToFrame]);

  // Update selected timestamp when frame changes
  useEffect(() => {
    if (timestamps.length > 0 && currentFrameIndex < timestamps.length) {
      const timestamp = timestamps[currentFrameIndex];
      setSelectedTimestamp(timestamp);
    }
  }, [currentFrameIndex, timestamps, setSelectedTimestamp]);

  // Load stats dynamically when selectedTimestamp changes (from scrubber or animation)
  useEffect(() => {
    if (selectedTimestamp) {
      loadStats(selectedTimestamp);
      // Also trigger timestamp stats load in AnalyticsSidebar via selectedTimestamp prop
    }
  }, [selectedTimestamp, loadStats]);

  // Cache stats whenever they're loaded successfully
  useEffect(() => {
    if (stats && !loadingStats) {
      cachedStatsRef.current = {
        occupied: stats.occupied || 0,
        vacant: stats.vacant || 0,
        total_slots: stats.total_slots || 0,
      };
    }
  }, [stats, loadingStats]);

  // Compute display stats: use current stats if available, otherwise use cached, otherwise compute from frameData
  const displayStats = useMemo(() => {
    // Priority 1: Use current stats if available and not loading
    if (stats && !loadingStats) {
      return stats;
    }
    
    // Priority 2: Use cached stats
    if (cachedStatsRef.current) {
      return cachedStatsRef.current;
    }
    
    // Priority 3: Compute from frameData if available
    if (displayFrameData && displayFrameData.length > 0) {
      const occupied = displayFrameData.filter(slot => slot.occupied === true).length;
      const total = displayFrameData.length;
      const vacant = total - occupied;
      
      // Cache this computed value
      cachedStatsRef.current = { occupied, vacant, total_slots: total };
      return { occupied, vacant, total_slots: total };
    }
    
    // Priority 4: Return null only if we have no data at all
    return null;
  }, [stats, loadingStats, displayFrameData]);

  // Smooth transition engine using requestAnimationFrame
  useLayoutEffect(() => {
    if (frameData.length > 0) {
      requestAnimationFrame(() => {
        setDisplayFrameData(frameData);
      });
    }
  }, [frameData]);

  // Calculate map scale - maximize map/cars visibility in larger container
  useEffect(() => {
    const calculateScale = () => {
      if (mapContainerRef.current) {
        const container = mapContainerRef.current.parentElement;
        if (container) {
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 140; // Account for title, controls, padding
          
          const scaleX = containerWidth / MAP_WIDTH;
          const scaleY = containerHeight / MAP_HEIGHT;
          // Maximize scale to make map/cars highly visible (up to 1.0x or fit to container)
          const scale = Math.min(scaleX, scaleY, 1.0); // Allow up to 100% of original size
          
          setMapScale(scale);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [mapLoaded]);

  // Handle manual frame change (from slider) - scrubbing
  const handleIndexChange = (newIndex) => {
    jumpToFrame(newIndex);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Timeline Controls - At the very top */}
      {timestamps.length > 0 && (
        <div style={{ flexShrink: 0, marginBottom: '6px' }}>
          <TimelineControls
            timestamps={timestamps}
            currentIndex={currentFrameIndex}
            playing={isPlaying}
            speed={playbackSpeed}
            onIndexChange={handleIndexChange}
            onPlayPause={() => isPlaying ? stopPlayback() : startPlayback()}
            onSpeedChange={setPlaybackSpeed}
          />
        </div>
      )}

      {/* Export button */}
      <div style={{ textAlign: 'center', marginBottom: '6px', flexShrink: 0 }}>
        {timestamps.length > 0 && (
          <ExportButton
            timestamps={timestamps}
            onFrameLoad={loadFrame}
            isPlaying={isPlaying}
            onPlayPause={() => isPlaying ? stopPlayback() : startPlayback()}
          />
        )}
      </div>
      
      {/* Map container wrapper - scales to fit */}
      <div
        ref={mapContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Map container - actual dimensions to preserve coordinates */}
        <div
          id="map-wrapper"
          style={{
            position: 'relative',
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            transform: `scale(${mapScale})`,
            transformOrigin: 'center center',
            backgroundColor: 'black',
            border: '2px solid #333',
            flexShrink: 0,
            // Ensure actual pixel dimensions are maintained
            imageRendering: 'pixelated',
          }}
        >
        {/* Background map image */}
        <img
          src="/map.png"
          alt="Parking map"
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          onLoad={handleMapLoad}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            imageRendering: 'pixelated',
          }}
        />

            {/* Static Slot ID labels and dots - rendered once, don't move */}
            {mapLoaded && displayFrameData.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${MAP_WIDTH}px`,
                  height: `${MAP_HEIGHT}px`,
                  pointerEvents: 'none',
                  zIndex: 30,
                }}
              >
                {displayFrameData.map((slot) => {
                  // Get display slot_id based on visual position mapping
                  const displaySlotId = slotMappingRef.current.size > 0 
                    ? getDisplaySlotId(slotMappingRef.current, slot.slot_id)
                    : slot.slot_id;
                  
                  return (
                    <div key={`slot-label-${slot.slot_id}`}>
                      {/* Slot ID label with glow effect - green if occupied, yellow if vacant */}
                      {/* Static position - doesn't move with animation */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${slot.x}px`,
                          top: `${slot.y - 15}px`,
                          pointerEvents: 'none',
                          zIndex: 30,
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: slot.occupied ? '#00ff00' : '#ffff00',
                          textShadow: slot.occupied 
                            ? '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00'
                            : '0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 30px #ffff00',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          transform: 'none', // No transform - static position
                        }}
                      >
                        Slot {displaySlotId}
                      </div>
                      
                      {/* Static slot dot - 8px circle */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${slot.x}px`,
                          top: `${slot.y}px`,
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: slot.occupied ? '#00ff00' : '#ffff00',
                          pointerEvents: 'none',
                          zIndex: 5,
                          transform: 'none', // No transform - static position
                        }}
                        title={`Slot ${displaySlotId}: ${slot.occupied ? 'Occupied' : 'Vacant'}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Animated car sprites and plates - these move */}
            {mapLoaded && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${MAP_WIDTH}px`,
                  height: `${MAP_HEIGHT}px`,
                }}
              >
                {displayFrameData.map((slot) => {
                  // Get display slot_id based on visual position mapping
                  const displaySlotId = slotMappingRef.current.size > 0 
                    ? getDisplaySlotId(slotMappingRef.current, slot.slot_id)
                    : slot.slot_id;
                  
                  return (
                    <div key={`car-${slot.slot_id}`}>
                      {/* Car sprite with tooltip if occupied */}
                      {/* Pass displaySlotId for rotation logic and tooltip display */}
                      {slot.occupied ? (
                        <CarTooltip
                          slot={{ ...slot, slot_id: displaySlotId }}
                          timestamps={timestamps}
                          currentTimestampIndex={currentFrameIndex}
                        >
                          <CarSprite
                            x={slot.x}
                            y={slot.y}
                            plate={slot.plate}
                            service={slot.service}
                            occupied={slot.occupied}
                            slot_id={displaySlotId}
                          />
                        </CarTooltip>
                      ) : (
                        <CarSprite
                          x={slot.x}
                          y={slot.y}
                          plate={slot.plate}
                          service={slot.service}
                          occupied={slot.occupied}
                          slot_id={displaySlotId}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

        {/* Stats Counter Overlay - Top Left Corner - Uses cached values when stats unavailable */}
        {displayStats && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.85)',
              color: 'white',
              borderRadius: '8px',
              zIndex: 1000,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              minWidth: '200px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              Live Slot Status
            </div>
            {selectedTimestamp && (
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px', fontFamily: 'monospace' }}>
                {new Date(selectedTimestamp).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            )}
            {loadingStats ? (
              <div style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
                Loading...
              </div>
            ) : (
              <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#00ff00' }}>●</span>
                  <span style={{ flex: 1, marginLeft: '8px' }}>Occupied:</span>
                  <span style={{ fontWeight: '600' }}>{displayStats.occupied ?? 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#ffff00' }}>●</span>
                  <span style={{ flex: 1, marginLeft: '8px' }}>Vacant:</span>
                  <span style={{ fontWeight: '600' }}>{displayStats.vacant ?? 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '6px', marginTop: '6px' }}>
                  <span style={{ color: '#fff' }}>Total:</span>
                  <span style={{ fontWeight: '700' }}>{displayStats.total_slots ?? 0}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {(loadingTimestamps || loadingFrame) && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: stats ? '210px' : '10px', // Position to the right of stats if visible
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              borderRadius: '4px',
              zIndex: 1000,
            }}
          >
            Loading...
          </div>
        )}
      </div>

      </div>
    </div>
  );
}

export default MapCanvas;
