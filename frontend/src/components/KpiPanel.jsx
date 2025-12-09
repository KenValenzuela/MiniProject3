import { useEffect } from 'react';
import { useRideHailingStore } from '../state/useRideHailingStore.jsx';
import KpiCard from './KpiCard';

/**
 * KpiPanel component for displaying KPI cards
 * Shows both timestamp-specific stats and overall summary statistics
 */
function KpiPanel({ selectedTimestamp }) {
  const { stats, summary, loadingStats, loadingSummary, loadStats, loadSummary } = useRideHailingStore();

  // Load stats when timestamp changes
  useEffect(() => {
    if (selectedTimestamp) {
      loadStats(selectedTimestamp);
    }
  }, [selectedTimestamp, loadStats]);

  // Load summary stats on mount
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

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

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return 'N/A';
    return `${minutes.toFixed(1)} min`;
  };

  return (
    <div>
      {/* Current Timestamp Stats */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#666' }}>
          Current Timestamp Stats
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          {loadingStats ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
              Loading stats...
            </div>
          ) : stats ? (
            <>
              <KpiCard title="Total Slots" value={formatNumber(stats.total_slots)} />
              <KpiCard title="Occupied" value={formatNumber(stats.occupied)} />
              <KpiCard title="Vacant" value={formatNumber(stats.vacant)} />
            </>
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#999' }}>
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Overall Summary Stats */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#666' }}>
          Overall Summary Statistics
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          {loadingSummary ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
              Loading summary...
            </div>
          ) : summary ? (
            <>
              <KpiCard title="Total Vehicles" value={formatNumber(summary.total_vehicles)} />
              <KpiCard title="Peak Occupancy" value={formatNumber(summary.peak_occupancy)} />
              <KpiCard title="Avg Dwell Time" value={formatDuration(summary.avg_dwell_time)} />
              <KpiCard title="Max Dwell Time" value={formatDuration(summary.max_dwell_time)} />
              <KpiCard title="Unique Reservations" value={formatNumber(summary.unique_reservations)} />
              <KpiCard title="Avg Reservation Duration" value={formatDuration(summary.avg_reservation_duration)} />
            </>
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#999' }}>
              No summary data available
            </div>
          )}
        </div>
        {summary && summary.peak_timestamp && (
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            <strong>Peak Timestamp:</strong> {formatTimestamp(summary.peak_timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

export default KpiPanel;
