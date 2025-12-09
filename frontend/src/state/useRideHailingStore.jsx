import { useState, useCallback, useRef, createContext, useContext } from 'react';
import * as api from '../api';

/**
 * Create a React Context for the ride-hailing store
 * This ensures all components share the same state instance
 */
const RideHailingContext = createContext(null);

/**
 * Provider component that wraps the app and provides shared state
 */
export function RideHailingProvider({ children }) {
  // State
  const [timestamps, setTimestamps] = useState([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [frameData, setFrameData] = useState([]);
  const [stats, setStats] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [serviceMix, setServiceMix] = useState({});
  const [occupancyTimeline, setOccupancyTimeline] = useState([]);
  const [dwellTime, setDwellTime] = useState(null);
  const [summary, setSummary] = useState(null);
  const [slotsByPlate, setSlotsByPlate] = useState([]);
  const [timestampStats, setTimestampStats] = useState(null);
  const [vehiclesAtTimestamp, setVehiclesAtTimestamp] = useState([]);
  
  // Loading flags
  const [loadingTimestamps, setLoadingTimestamps] = useState(false);
  const [loadingFrame, setLoadingFrame] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUtilization, setLoadingUtilization] = useState(false);
  const [loadingServiceMix, setLoadingServiceMix] = useState(false);
  const [loadingOccupancyTimeline, setLoadingOccupancyTimeline] = useState(false);
  const [loadingDwellTime, setLoadingDwellTime] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSlotsByPlate, setLoadingSlotsByPlate] = useState(false);
  const [loadingTimestampStats, setLoadingTimestampStats] = useState(false);
  const [loadingVehiclesAtTimestamp, setLoadingVehiclesAtTimestamp] = useState(false);

  /**
   * Load all available timestamps
   */
  const loadTimestamps = useCallback(async () => {
    setLoadingTimestamps(true);
    try {
      const data = await api.getTimestamps();
      setTimestamps(data);
    } catch (error) {
      console.error('Error loading timestamps:', error);
    } finally {
      setLoadingTimestamps(false);
    }
  }, []);

  // Track current loading frame to prevent duplicates
  const loadingFrameRef = useRef(null);
  const currentFrameRef = useRef(null);

  /**
   * Load frame data for a specific timestamp
   */
  const loadFrame = useCallback(async (ts) => {
    // Prevent duplicate requests for the same frame
    if (loadingFrameRef.current === ts || currentFrameRef.current === ts) {
      return;
    }

    // Cancel any pending request
    if (loadingFrameRef.current) {
      // Request already in progress for different frame, wait for it
      return;
    }

    loadingFrameRef.current = ts;
    setLoadingFrame(true);
    
    try {
      const data = await api.getFrame(ts);
      setFrameData(data);
      setSelectedTimestamp(ts);
      currentFrameRef.current = ts;
    } catch (error) {
      console.error('Error loading frame:', error);
      // Only log, don't throw - allow retry
    } finally {
      setLoadingFrame(false);
      loadingFrameRef.current = null;
    }
  }, []);

  /**
   * Load stats for a specific timestamp
   */
  const loadStats = useCallback(async (ts) => {
    if (!ts) return;
    setLoadingStats(true);
    try {
      const data = await api.getStats(ts);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Load slot utilization data
   */
  const loadUtilization = useCallback(async () => {
    setLoadingUtilization(true);
    try {
      const data = await api.getUtilization();
      setUtilization(data);
    } catch (error) {
      console.error('Error loading utilization:', error);
    } finally {
      setLoadingUtilization(false);
    }
  }, []);

  /**
   * Load service mix data
   */
  const loadServiceMix = useCallback(async () => {
    setLoadingServiceMix(true);
    try {
      const data = await api.getServiceMix();
      setServiceMix(data);
    } catch (error) {
      console.error('Error loading service mix:', error);
    } finally {
      setLoadingServiceMix(false);
    }
  }, []);

  /**
   * Load occupancy timeline data
   */
  const loadOccupancyTimeline = useCallback(async () => {
    setLoadingOccupancyTimeline(true);
    try {
      const data = await api.getOccupancyTimeline();
      setOccupancyTimeline(data);
    } catch (error) {
      console.error('Error loading occupancy timeline:', error);
    } finally {
      setLoadingOccupancyTimeline(false);
    }
  }, []);

  /**
   * Load dwell time data
   */
  const loadDwellTime = useCallback(async () => {
    setLoadingDwellTime(true);
    try {
      const data = await api.getDwellTime();
      setDwellTime(data);
    } catch (error) {
      console.error('Error loading dwell time:', error);
    } finally {
      setLoadingDwellTime(false);
    }
  }, []);

  /**
   * Load summary statistics
   */
  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await api.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  /**
   * Load slots by plate for a specific timestamp
   */
  const loadSlotsByPlate = useCallback(async (ts) => {
    if (!ts) return;
    setLoadingSlotsByPlate(true);
    try {
      const data = await api.getSlotsByPlate(ts);
      setSlotsByPlate(data);
    } catch (error) {
      console.error('Error loading slots by plate:', error);
    } finally {
      setLoadingSlotsByPlate(false);
    }
  }, []);

  /**
   * Load timestamp-specific statistics (dynamic based on scrubber position)
   * @param {string} ts - ISO-8601 timestamp string
   */
  const loadTimestampStats = useCallback(async (ts) => {
    if (!ts) return;
    setLoadingTimestampStats(true);
    try {
      const data = await api.getStatsTimestamp(ts);
      setTimestampStats(data);
    } catch (error) {
      console.error('Error loading timestamp stats:', error);
    } finally {
      setLoadingTimestampStats(false);
    }
  }, []);

  /**
   * Load vehicles present at a specific timestamp for the table
   * @param {string} ts - ISO-8601 timestamp string
   */
  const loadVehiclesAtTimestamp = useCallback(async (ts) => {
    if (!ts) return;
    setLoadingVehiclesAtTimestamp(true);
    try {
      const data = await api.getVehiclesAtTimestamp(ts);
      setVehiclesAtTimestamp(data);
    } catch (error) {
      console.error('Error loading vehicles at timestamp:', error);
    } finally {
      setLoadingVehiclesAtTimestamp(false);
    }
  }, []);

  const value = {
    // State
    timestamps,
    selectedTimestamp,
    frameData,
    stats,
    utilization,
    serviceMix,
    occupancyTimeline,
    dwellTime,
    summary,
    slotsByPlate,
    timestampStats,
    vehiclesAtTimestamp,
    
    // Loading flags
    loadingTimestamps,
    loadingFrame,
    loadingStats,
    loadingUtilization,
    loadingServiceMix,
    loadingOccupancyTimeline,
    loadingDwellTime,
    loadingSummary,
    loadingSlotsByPlate,
    loadingTimestampStats,
    loadingVehiclesAtTimestamp,
    
    // Methods
    loadTimestamps,
    loadFrame,
    loadStats,
    loadUtilization,
    loadServiceMix,
    loadOccupancyTimeline,
    loadDwellTime,
    loadSummary,
    loadSlotsByPlate,
    loadTimestampStats,
    loadVehiclesAtTimestamp,
    setSelectedTimestamp,
  };

  return (
    <RideHailingContext.Provider value={value}>
      {children}
    </RideHailingContext.Provider>
  );
}

/**
 * Custom hook to access the ride-hailing store
 * Must be used within a RideHailingProvider
 */
export function useRideHailingStore() {
  const context = useContext(RideHailingContext);
  if (!context) {
    throw new Error('useRideHailingStore must be used within a RideHailingProvider');
  }
  return context;
}
