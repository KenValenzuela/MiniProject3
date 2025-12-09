import React, { useEffect } from 'react'
import AnalyticsSidebar from './components/AnalyticsSidebar'
import { useRideHailingStore } from './state/useRideHailingStore.jsx'

function App() {
  const { selectedTimestamp, loadSummary, loadOccupancyTimeline, loadDwellTime, loadUtilization, loadServiceMix } = useRideHailingStore();

  // Load all statistics on mount
  useEffect(() => {
    loadSummary();
    loadOccupancyTimeline();
    loadDwellTime();
    loadUtilization();
    loadServiceMix();
  }, [loadSummary, loadOccupancyTimeline, loadDwellTime, loadUtilization, loadServiceMix]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '2000px',
          margin: '0 auto',
        }}
      >
        {/* Dashboard Section - Full width */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            maxHeight: 'calc(100vh - 24px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: '8px',
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
            }}
          >
            Sky Harbor Ride-Hailing Analytics Dashboard
          </h1>
          
          {/* Executive Summary Section */}
          <div
            style={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              borderLeft: '4px solid #1a73e8',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#2c2c2c',
              }}
            >
              <strong>Executive Summary:</strong> This dashboard provides real-time operational intelligence for Sky Harbor's ride-hailing parking management. Key insights include <strong>peak occupancy patterns</strong> to optimize slot allocation, <strong>average vehicle dwell times</strong> to improve turnover rates, and <strong>service provider distribution</strong> to understand market share. The live animation shows current slot utilization, while historical analytics reveal trends that inform capacity planning, staffing decisions, and infrastructure investments. Use this data to <strong>reduce passenger wait times</strong>, <strong>maximize parking efficiency</strong>, and <strong>enhance overall airport operations</strong>.
            </p>
          </div>
          
          <AnalyticsSidebar selectedTimestamp={selectedTimestamp} />
        </div>
      </div>
    </div>
  )
}

export default App

