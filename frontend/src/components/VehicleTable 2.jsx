import { useMemo, useEffect, useState } from 'react';
import { useRideHailingStore } from '../state/useRideHailingStore';
import * as api from '../api';
import { getDisplaySlotId } from '../utils/slotMapping';

// Available car sprites (same as CarSprite component)
const CAR_SPRITES = [
  '/car_sprites/Audi.png',
  '/car_sprites/Car.png',
  '/car_sprites/Mini_truck.png',
  '/car_sprites/Mini_van.png',
  '/car_sprites/taxi.png',
  '/car_sprites/truck.png',
];

// Map to store plate -> car sprite assignments (consistent per plate)
const plateToCarSprite = new Map();

/**
 * Get a consistent car sprite for a given plate number
 */
function getCarSpriteForPlate(plate) {
  if (!plate) return CAR_SPRITES[0];
  
  if (!plateToCarSprite.has(plate)) {
    let hash = 0;
    for (let i = 0; i < plate.length; i++) {
      hash = ((hash << 5) - hash) + plate.charCodeAt(i);
      hash = hash & hash;
    }
    const spriteIndex = Math.abs(hash) % CAR_SPRITES.length;
    plateToCarSprite.set(plate, CAR_SPRITES[spriteIndex]);
  }
  
  return plateToCarSprite.get(plate);
}

/**
 * Format duration in minutes to readable string
 */
function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return 'N/A';
  return `${minutes.toFixed(1)} min`;
}

/**
 * VehicleTable component - displays same info as CarTooltip in table format
 * Shows: Plate, Service, Slot ID, Entry Time, Time Here (dwell time)
 */
function VehicleTable({ selectedTimestamp }) {
  const { frameData, timestamps, loadingFrame } = useRideHailingStore();
  const [vehicleDetailsMap, setVehicleDetailsMap] = useState(new Map());
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Debug: Log frameData whenever it changes
  useEffect(() => {
    console.log('[VehicleTable] frameData changed:', {
      exists: !!frameData,
      isArray: Array.isArray(frameData),
      length: frameData?.length || 0,
      loadingFrame,
      sample: frameData?.[0],
    });
  }, [frameData, loadingFrame]);

  // Extract occupied vehicles directly from frameData (same source as tooltip)
  const vehicles = useMemo(() => {
    if (!frameData || frameData.length === 0) {
      console.log('[VehicleTable] No frameData available');
      return [];
    }

    console.log('[VehicleTable] Processing frameData:', {
      totalSlots: frameData.length,
      sampleSlot: frameData[0],
      occupiedCount: frameData.filter(s => s.occupied).length,
    });

    // Filter for occupied slots with valid plates (same logic as what renders cars)
    const occupiedSlots = frameData.filter(slot => {
      const isOccupied = slot.occupied === true;
      const hasPlate = slot.plate && 
                      String(slot.plate).trim() !== '' &&
                      String(slot.plate).toLowerCase() !== 'null' &&
                      String(slot.plate).toLowerCase() !== 'undefined';
      
      return isOccupied && hasPlate;
    });

    console.log('[VehicleTable] Found occupied slots:', {
      count: occupiedSlots.length,
      samples: occupiedSlots.slice(0, 3).map(s => ({
        plate: s.plate,
        service: s.service,
        slot_id: s.slot_id,
        occupied: s.occupied,
      })),
    });

    // Create vehicle entries - one per occupied slot
    const result = occupiedSlots.map(slot => ({
      plate_number: String(slot.plate).trim(),
      service: slot.service || 'Unknown',
      slot_id: slot.slot_id,
      x: slot.x,
      y: slot.y,
    }));

    console.log('[VehicleTable] Created vehicles:', result.length, result.slice(0, 2));
    return result;
  }, [frameData]);

  // Fetch entry time and dwell time from backend when timestamp changes
  useEffect(() => {
    if (!selectedTimestamp || vehicles.length === 0) {
      setVehicleDetailsMap(new Map());
      return;
    }

    setLoadingDetails(true);
    api.getVehiclesAtTimestamp(selectedTimestamp)
      .then((data) => {
        const detailsMap = new Map();
        data.forEach(vehicle => {
          detailsMap.set(vehicle.plate_number, {
            entry_time_display: vehicle.entry_time_display || 'N/A',
            current_dwell_time_minutes: vehicle.current_dwell_time_minutes ?? 0,
          });
        });
        setVehicleDetailsMap(detailsMap);
      })
      .catch((error) => {
        console.error('Error loading vehicle details:', error);
        setVehicleDetailsMap(new Map());
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [selectedTimestamp, vehicles.length]);

  // Combine vehicles with their details
  const vehiclesWithDetails = useMemo(() => {
    return vehicles.map(vehicle => {
      const details = vehicleDetailsMap.get(vehicle.plate_number);
      return {
        ...vehicle,
        entry_time_display: details?.entry_time_display || 'N/A',
        current_dwell_time_minutes: details?.current_dwell_time_minutes ?? 0,
      };
    });
  }, [vehicles, vehicleDetailsMap]);

  // Debug: Log what we have
  useEffect(() => {
    console.log('[VehicleTable] Component state:', {
      frameDataLength: frameData?.length || 0,
      vehiclesLength: vehicles.length,
      vehiclesWithDetailsLength: vehiclesWithDetails.length,
      selectedTimestamp,
      loadingFrame,
    });
  }, [frameData, vehicles, vehiclesWithDetails, selectedTimestamp, loadingFrame]);

  // Loading state - show loading if frame is loading OR details are loading
  if (loadingFrame || (loadingDetails && vehiclesWithDetails.length === 0)) {
    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '10px', 
        padding: '16px', 
        border: '1px solid #e5e5e5',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '15px', 
          fontWeight: '600',
          color: '#2c2c2c'
        }}>
          Active Vehicles
        </h4>
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          {loadingFrame ? 'Loading frame data...' : 'Loading vehicle details...'}
        </div>
      </div>
    );
  }

  // Empty state
  if (vehiclesWithDetails.length === 0) {
    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '10px', 
        padding: '16px', 
        border: '1px solid #e5e5e5',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '15px', 
          fontWeight: '600',
          color: '#2c2c2c'
        }}>
          Active Vehicles
        </h4>
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          {!frameData || frameData.length === 0 
            ? 'Waiting for frame data...' 
            : 'No vehicles at this timestamp'}
        </div>
      </div>
    );
  }

  // Render table
  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '10px', 
      padding: '16px', 
      border: '1px solid #e5e5e5',
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      maxHeight: '400px',
      overflowY: 'auto',
    }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '15px', 
        fontWeight: '600',
        color: '#2c2c2c'
      }}>
        Active Vehicles ({vehiclesWithDetails.length})
      </h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ 
            borderBottom: '2px solid #e0e0e0',
            textAlign: 'left',
          }}>
            <th style={{ padding: '10px 8px', fontWeight: '600', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Vehicle</th>
            <th style={{ padding: '10px 8px', fontWeight: '600', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Service</th>
            <th style={{ padding: '10px 8px', fontWeight: '600', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Slot ID</th>
            <th style={{ padding: '10px 8px', fontWeight: '600', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Entry Time</th>
            <th style={{ padding: '10px 8px', fontWeight: '600', color: '#666', fontSize: '12px', textTransform: 'uppercase' }}>Time Here</th>
          </tr>
        </thead>
        <tbody>
          {vehiclesWithDetails.map((vehicle, index) => {
            const carSprite = getCarSpriteForPlate(vehicle.plate_number);
            return (
              <tr 
                key={`${vehicle.plate_number}-${vehicle.slot_id}-${index}`}
                style={{ 
                  borderBottom: index < vehiclesWithDetails.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={carSprite} 
                    alt={`Car ${vehicle.plate_number}`}
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'contain',
                      borderRadius: '4px',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span style={{ fontWeight: '500', color: '#333' }}>{vehicle.plate_number}</span>
                </td>
                <td style={{ padding: '12px 8px', color: '#666' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: vehicle.service === 'Uber' ? '#1a73e8' : vehicle.service === 'Lyft' ? '#ff00aa' : '#999999',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {vehicle.service}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', color: '#666', fontFamily: 'monospace' }}>
                  {vehicle.slot_id}
                </td>
                <td style={{ padding: '12px 8px', color: '#666', fontFamily: 'monospace' }}>
                  {vehicle.entry_time_display}
                </td>
                <td style={{ padding: '12px 8px', color: '#666', fontFamily: 'monospace' }}>
                  {formatDuration(vehicle.current_dwell_time_minutes)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleTable;
