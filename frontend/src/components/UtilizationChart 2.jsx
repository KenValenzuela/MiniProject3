import { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRideHailingStore } from '../state/useRideHailingStore';

/**
 * UtilizationChart component for displaying slot utilization
 * Shows top 20 slots by usage count in descending order
 */
function UtilizationChart() {
  const { utilization, loadingUtilization, loadUtilization } = useRideHailingStore();

  // Load utilization data on mount
  useEffect(() => {
    loadUtilization();
  }, [loadUtilization]);

  // Prepare chart data - top 20 slots
  const chartData = useMemo(() => {
    if (!utilization || utilization.length === 0) {
      return [];
    }

    return utilization
      .slice(0, 20) // Top 20 slots
      .map((item) => ({
        slot_id: String(item.slot_id),
        usage_count: item.usage_count,
      }));
  }, [utilization]);

  if (loadingUtilization) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Loading utilization data...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        No utilization data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="slot_id"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: '12px' }}
            label={{ value: 'Slot ID', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            style={{ fontSize: '12px' }}
            label={{ value: 'Usage Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip formatter={(value) => [value, 'Usage Count']} />
          <Legend />
          <Bar dataKey="usage_count" fill="#28a745" name="Usage Count" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UtilizationChart;

