import { useEffect } from 'react';
import { useRideHailingStore } from '../state/useRideHailingStore';
import KpiCard from './KpiCard';
import ServiceMixChart from './ServiceMixChart';
import UtilizationChart from './UtilizationChart';
import DwellHistogram from './DwellHistogram';
import MapCanvas from './MapCanvas';
import VehicleTable from './VehicleTable';

/**
 * AnalyticsSidebar component with Bento grid layout
 * Displays all statistics in an organized grid pattern
 */
function AnalyticsSidebar({ selectedTimestamp }) {
  const { 
    stats, 
    timestampStats, 
    timestamps,
    summary,
    loadingStats, 
    loadingTimestampStats, 
    loadStats, 
    loadTimestampStats,
    loadSummary
  } = useRideHailingStore();

  // Load summary on mount
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Load stats when timestamp changes
  useEffect(() => {
    if (selectedTimestamp) {
      loadStats(selectedTimestamp);
      loadTimestampStats(selectedTimestamp); // Load timestamp-specific stats
    } else if (timestamps && timestamps.length > 0) {
      // If no selectedTimestamp but we have timestamps, use the first one
      const firstTimestamp = timestamps[0];
      loadStats(firstTimestamp);
      loadTimestampStats(firstTimestamp);
    }
  }, [selectedTimestamp, timestamps, loadStats, loadTimestampStats]);

  // Format helpers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return 'N/A';
    return `${minutes.toFixed(1)} min`;
  };

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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: 'minmax(100px, auto)',
        gap: '16px',
        width: '100%',
        padding: '0',
      }}
    >
      {/* Row 0: Working Timestamp-Specific KPIs - 4 cards (dynamic based on scrubber, Sky Harbor styled) */}
      <div style={{ gridColumn: 'span 3', minHeight: '90px' }}>
        {loadingTimestampStats ? (
          <KpiCard title="Avg Dwell Time" value="Loading..." variant="blue" />
        ) : (
          <KpiCard 
            title="Avg Dwell Time" 
            value={timestampStats ? formatDuration(timestampStats.avg_dwell_time) : (summary ? formatDuration(summary.avg_dwell_time) : 'N/A')} 
            variant="blue" 
          />
        )}
      </div>
      <div style={{ gridColumn: 'span 3', minHeight: '90px' }}>
        {loadingTimestampStats ? (
          <KpiCard title="Max Dwell Time" value="Loading..." variant="orange" />
        ) : (
          <KpiCard 
            title="Max Dwell Time" 
            value={timestampStats ? formatDuration(timestampStats.max_dwell_time) : (summary ? formatDuration(summary.max_dwell_time) : 'N/A')} 
            variant="orange" 
          />
        )}
      </div>
      <div style={{ gridColumn: 'span 3', minHeight: '90px' }}>
        {loadingTimestampStats ? (
          <KpiCard title="Active Reservations" value="Loading..." variant="white" />
        ) : (
          <KpiCard 
            title="Active Reservations" 
            value={timestampStats ? formatNumber(timestampStats.unique_reservations) : (summary ? formatNumber(summary.unique_reservations) : 'N/A')} 
            variant="white" 
          />
        )}
      </div>
      <div style={{ gridColumn: 'span 3', minHeight: '90px' }}>
        {loadingTimestampStats ? (
          <KpiCard title="Avg Reservation Duration" value="Loading..." variant="blue" />
        ) : (
          <KpiCard 
            title="Avg Reservation Duration" 
            value={timestampStats ? formatDuration(timestampStats.avg_reservation_duration) : (summary ? formatDuration(summary.avg_reservation_duration) : 'N/A')} 
            variant="blue" 
          />
        )}
      </div>

      {/* Spacer row for white space between KPIs and main content */}
      <div style={{ gridColumn: 'span 12', height: '24px' }}></div>

      {/* Row 1: Main Content - Animation (larger, focal point) and Charts Grouped */}
      {/* Left - Animation (larger, prominent) */}
      <div style={{ gridColumn: 'span 8', minHeight: '650px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '10px', 
          padding: '16px', 
          height: '100%', 
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#1a1a1a',
              letterSpacing: '-0.3px'
            }}>
              Vehicle Occupancy Animation
            </h3>
            <p style={{ 
              margin: '2px 0 0 0', 
              fontSize: '13px', 
              color: '#666',
              fontWeight: '400'
            }}>
              Real-time parking slot occupancy visualization
            </p>
          </div>
          <div style={{ 
            flex: 1, 
            minHeight: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <MapCanvas />
          </div>
        </div>
      </div>
      
      {/* Right - All Charts Grouped Together */}
      <div style={{ 
        gridColumn: 'span 4', 
        minHeight: '650px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px' 
      }}>
        {/* Charts Header */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '10px', 
          padding: '16px', 
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          marginBottom: '0'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: '-0.3px'
          }}>
            Analytics Overview
          </h3>
          <p style={{ 
            margin: '2px 0 0 0', 
            fontSize: '12px', 
            color: '#666',
            fontWeight: '400'
          }}>
            Performance metrics and trends
          </p>
        </div>

        {/* Service Mix Chart */}
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            padding: '12px', 
            height: '100%', 
            border: '1px solid #e5e5e5',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '15px', 
              fontWeight: '600',
              color: '#2c2c2c'
            }}>
              Service Share Over Time
            </h4>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ServiceMixChart />
            </div>
          </div>
        </div>
        
        {/* Utilization Chart */}
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            padding: '12px', 
            height: '100%', 
            border: '1px solid #e5e5e5',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '15px', 
              fontWeight: '600',
              color: '#2c2c2c'
            }}>
              Top 20 Slot Utilization
            </h4>
            <div style={{ flex: 1, minHeight: 0 }}>
              <UtilizationChart />
            </div>
          </div>
        </div>

        {/* Dwell Time Histogram */}
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            padding: '12px', 
            height: '100%', 
            border: '1px solid #e5e5e5',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '15px', 
              fontWeight: '600',
              color: '#2c2c2c'
            }}>
              Vehicle Dwell Time Distribution
            </h4>
            <div style={{ flex: 1, minHeight: 0 }}>
              <DwellHistogram />
            </div>
          </div>
        </div>

        {/* Vehicle Table */}
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <VehicleTable selectedTimestamp={selectedTimestamp} />
        </div>

      </div>

    </div>
  );
}

export default AnalyticsSidebar;

