import { useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRideHailingStore } from '../state/useRideHailingStore';

/**
 * ServiceMixChart component for displaying service distribution over time
 * Uses stacked area chart to show how many slots are occupied by each service
 */
function ServiceMixChart() {
  const { serviceMix, loadingServiceMix, loadServiceMix } = useRideHailingStore();

  // Load service mix data on mount
  useEffect(() => {
    loadServiceMix();
  }, [loadServiceMix]);

  // Convert backend structure to chart data format
  const chartData = useMemo(() => {
    if (!serviceMix || Object.keys(serviceMix).length === 0) {
      return [];
    }

    // Get all unique service names
    const serviceNames = new Set();
    Object.values(serviceMix).forEach((services) => {
      Object.keys(services).forEach((service) => serviceNames.add(service));
    });

    // Convert to array format
    const data = Object.entries(serviceMix)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([timestamp, services]) => {
        const entry = { timestamp };
        serviceNames.forEach((service) => {
          entry[service] = services[service] || 0;
        });
        return entry;
      });

    return data;
  }, [serviceMix]);

  // Get unique service names for rendering areas
  const serviceNames = useMemo(() => {
    const names = new Set();
    Object.values(serviceMix).forEach((services) => {
      Object.keys(services).forEach((service) => names.add(service));
    });
    return Array.from(names);
  }, [serviceMix]);

  // Color mapping for services
  const serviceColors = {
    Uber: '#1a73e8',
    Lyft: '#ff00aa',
  };

  const getServiceColor = (service) => serviceColors[service] || '#999999';

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

  if (loadingServiceMix) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Loading service mix data...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        No service mix data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            style={{ fontSize: '12px' }}
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            style={{ fontSize: '12px' }}
            label={{ value: 'Number of Vehicles', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={(value) => formatTimestamp(value)}
            formatter={(value) => [value, 'Vehicles']}
          />
          <Legend />
          {serviceNames.map((service) => (
            <Area
              key={service}
              type="monotone"
              dataKey={service}
              stackId="1"
              stroke={getServiceColor(service)}
              fill={getServiceColor(service)}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ServiceMixChart;

