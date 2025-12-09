import { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRideHailingStore } from '../state/useRideHailingStore';

/**
 * DwellHistogram component for displaying vehicle dwell time distribution
 * Shows histogram of dwell times in minutes
 */
function DwellHistogram() {
  const { dwellTime, loadingDwellTime, loadDwellTime } = useRideHailingStore();

  // Load dwell time data on mount
  useEffect(() => {
    loadDwellTime();
  }, [loadDwellTime]);

  // Prepare histogram data with bins
  const chartData = useMemo(() => {
    if (!dwellTime || !dwellTime.distribution || dwellTime.distribution.length === 0) {
      return [];
    }

    const distribution = dwellTime.distribution;
    const min = Math.min(...distribution);
    const max = Math.max(...distribution);
    const binCount = 30;
    const binWidth = (max - min) / binCount;

    // Create bins
    const bins = Array(binCount).fill(0).map((_, i) => ({
      bin_start: min + i * binWidth,
      bin_end: min + (i + 1) * binWidth,
      count: 0,
    }));

    // Count values in each bin
    distribution.forEach((value) => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1
      );
      bins[binIndex].count += 1;
    });

    // Format for chart (use midpoint of bin as label)
    return bins.map((bin) => ({
      range: `${bin.bin_start.toFixed(1)}-${bin.bin_end.toFixed(1)}`,
      midpoint: ((bin.bin_start + bin.bin_end) / 2).toFixed(1),
      count: bin.count,
    }));
  }, [dwellTime]);

  if (loadingDwellTime) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Loading dwell time data...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        No dwell time data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      {dwellTime && (
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Avg: {dwellTime.avg_dwell_time?.toFixed(1)} min | Max: {dwellTime.max_dwell_time?.toFixed(1)} min
        </div>
      )}
      <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="midpoint"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: '12px' }}
            label={{ value: 'Dwell Time (minutes)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis style={{ fontSize: '12px' }} label={{ value: 'Number of Vehicles', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value) => [value, 'Vehicles']}
            labelFormatter={(value, payload) => {
              if (payload && payload[0]) {
                return `Range: ${payload[0].payload.range} min`;
              }
              return value;
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#ff7f0e" name="Dwell Time" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DwellHistogram;
