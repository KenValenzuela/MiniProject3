import { useState, useEffect, useRef } from 'react';

/**
 * CarTooltip component - shows tooltip on hover with vehicle information
 */
function CarTooltip({ slot, timestamps, currentTimestampIndex, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

  // Calculate dwell time for this vehicle
  const calculateDwellTime = () => {
    if (!slot.plate || !timestamps || timestamps.length === 0) return null;
    
    // Find first and last appearance of this plate
    // This is a simplified calculation - in a real system, we'd track this in state
    // For now, estimate based on current position in timeline
    const currentTime = new Date(timestamps[currentTimestampIndex]);
    // Estimate: assume vehicle appears for average duration
    // In production, this would come from backend
    return '~5.2 min'; // Placeholder
  };

  const handleMouseEnter = (e) => {
    setIsVisible(true);
    updateMousePosition(e);
  };

  const handleMouseMove = (e) => {
    if (isVisible) {
      updateMousePosition(e);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const updateMousePosition = (e) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const dwellTime = calculateDwellTime();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {isVisible && slot.occupied && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: `${mousePos.x + 10}px`,
            top: `${mousePos.y - 10}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-in',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Vehicle Info</div>
          <div>Plate: {slot.plate || 'N/A'}</div>
          <div>Service: {slot.service || 'N/A'}</div>
          <div>Slot ID: {slot.slot_id}</div>
          {dwellTime && <div>Dwell Time: {dwellTime}</div>}
        </div>
      )}
    </div>
  );
}

export default CarTooltip;

