import axios from 'axios';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Get all available timestamps
 * @returns {Promise<Array<string>>} Array of ISO-8601 timestamp strings
 */
export async function getTimestamps() {
  const response = await axios.get(`${API_BASE}/timestamps`);
  return response.data;
}

/**
 * Get frame data for a specific timestamp
 * @param {string} ts - ISO-8601 timestamp string
 * @returns {Promise<Array>} Array of slot objects
 */
export async function getFrame(ts) {
  const encodedTs = encodeURIComponent(ts);
  const response = await axios.get(`${API_BASE}/frame/${encodedTs}`);
  return response.data;
}

/**
 * Get statistics for a specific timestamp
 * @param {string} ts - ISO-8601 timestamp string
 * @returns {Promise<Object>} Stats object with total_slots, occupied, vacant
 */
export async function getStats(ts) {
  const encodedTs = encodeURIComponent(ts);
  const response = await axios.get(`${API_BASE}/stats/${encodedTs}`);
  return response.data;
}

/**
 * Get slot utilization data
 * @returns {Promise<Array>} Array of slot utilization objects
 */
export async function getUtilization() {
  const response = await axios.get(`${API_BASE}/utilization`);
  return response.data;
}

/**
 * Get service mix distribution over time
 * @returns {Promise<Object>} Object mapping timestamps to service counts
 */
export async function getServiceMix() {
  const response = await axios.get(`${API_BASE}/service_mix`);
  return response.data;
}

/**
 * Get occupancy timeline (occupancy count per timestamp)
 * @returns {Promise<Array>} Array of {timestamp, occupancy_count} objects
 */
export async function getOccupancyTimeline() {
  const response = await axios.get(`${API_BASE}/occupancy_timeline`);
  return response.data;
}

/**
 * Get dwell time statistics and distribution
 * @returns {Promise<Object>} Object with avg_dwell_time, max_dwell_time, and distribution array
 */
export async function getDwellTime() {
  const response = await axios.get(`${API_BASE}/dwell_time`);
  return response.data;
}

/**
 * Get overall summary statistics
 * @returns {Promise<Object>} Object with total_vehicles, peak_occupancy, etc.
 */
export async function getSummary() {
  const response = await axios.get(`${API_BASE}/summary`);
  return response.data;
}

export async function getStatsTimestamp(ts) {
  const response = await axios.get(`${API_BASE}/stats_timestamp/${encodeURIComponent(ts)}`);
  return response.data;
}

/**
 * Get slots by plate for a specific timestamp
 * @param {string} ts - ISO-8601 timestamp string
 * @returns {Promise<Array>} Array of slot objects with plate, slot_id, occupied status
 */
export async function getSlotsByPlate(ts) {
  const encodedTs = encodeURIComponent(ts);
  const response = await axios.get(`${API_BASE}/slots_by_plate/${encodedTs}`);
  return response.data;
}

/**
 * Get vehicles present at a specific timestamp with entry times
 * @param {string} ts - ISO-8601 timestamp string
 * @returns {Promise<Array>} Array of vehicle objects with plate_number, service, entry_time
 */
export async function getVehiclesAtTimestamp(ts) {
  const encodedTs = encodeURIComponent(ts);
  const response = await axios.get(`${API_BASE}/vehicles_at_timestamp/${encodedTs}`);
  return response.data;
}

