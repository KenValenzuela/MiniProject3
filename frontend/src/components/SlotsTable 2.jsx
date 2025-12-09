import { useEffect } from 'react';
import { useRideHailingStore } from '../state/useRideHailingStore';

/**
 * SlotsTable component - displays live slot status by license plate
 */
function SlotsTable({ selectedTimestamp }) {
  const { slotsByPlate, loadingSlotsByPlate, loadSlotsByPlate } = useRideHailingStore();

  // Load slots by plate when timestamp changes
  useEffect(() => {
    if (selectedTimestamp) {
      loadSlotsByPlate(selectedTimestamp);
    }
  }, [selectedTimestamp, loadSlotsByPlate]);

  // Format timestamp for display
  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
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

  if (loadingSlotsByPlate) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Loading slot data...
      </div>
    );
  }

  // Separate occupied and vacant slots
  const occupiedSlots = slotsByPlate.filter(slot => slot.occupied);
  const vacantSlots = slotsByPlate.filter(slot => !slot.occupied);

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
        Live Slot Status by License Plate
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Occupied Slots */}
        <div>
          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#d32f2f' }}>
            Occupied ({occupiedSlots.length})
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>Slot ID</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>License Plate</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>Service</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {occupiedSlots.length > 0 ? (
                  occupiedSlots.map((slot) => (
                    <tr key={slot.slot_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px' }}>{slot.slot_id}</td>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{slot.plate || 'N/A'}</td>
                      <td style={{ padding: '10px' }}>{slot.service || 'N/A'}</td>
                      <td style={{ padding: '10px', color: '#666', fontSize: '12px' }}>{formatTimestamp(slot.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      No occupied slots
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vacant Slots */}
        <div>
          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#388e3c' }}>
            Vacant ({vacantSlots.length})
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>Slot ID</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e5e5', fontWeight: '600' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {vacantSlots.length > 0 ? (
                  vacantSlots.map((slot) => (
                    <tr key={slot.slot_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px' }}>{slot.slot_id}</td>
                      <td style={{ padding: '10px', color: '#388e3c', fontWeight: '500' }}>Vacant</td>
                      <td style={{ padding: '10px', color: '#666', fontSize: '12px' }}>{formatTimestamp(slot.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      No vacant slots
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlotsTable;

