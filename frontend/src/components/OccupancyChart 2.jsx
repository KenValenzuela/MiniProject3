import { useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRideHailingStore } from '../state/useRideHailingStore';

/**
 * OccupancyChart component for displaying slot occupancy over time
 * Shows a line chart of occupancy count per timestamp
 */
function OccupancyChart() {
  const { occupancyTimeline, loadingOccupancyTimeline, loadOccupancyTimeline } = useRideHailingStore();

  // Load occupancy timeline data on mount
  useEffect(() => {
    loadOccupancyTimeline();
  }, [loadOccupancyTimeline]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!occupancyTimeline || occupancyTimeline.length === 0) {
      return [];
    }

    return occupancyTimeline.map((item) => ({
      timestamp: item.timestamp,
      occupancy_count: item.occupancy_count,
    }));
  }, [occupancyTimeline]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  if (loadingOccupancyTimeline) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Loading occupancy timeline...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        No occupancy timeline data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600', marginTop: 0 }}>
        Slot Occupancy Over Time
      </h3>
      <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            style={{ fontSize: '12px' }}
          />
          <YAxis style={{ fontSize: '12px' }} />
          <Tooltip
            labelFormatter={(value) => formatTimestamp(value)}
            formatter={(value) => [value, 'Vehicles']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="occupancy_count"
            stroke="#007bff"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Occupancy"
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OccupancyChart;

