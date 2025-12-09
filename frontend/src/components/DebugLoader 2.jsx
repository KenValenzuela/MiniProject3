import { useEffect } from 'react';
import { useRideHailingStore } from '../state/useRideHailingStore';

/**
 * Debug component to test API connectivity
 * Loads timestamps on mount and logs them to console
 */
function DebugLoader() {
  const { loadTimestamps, timestamps, loadingTimestamps } = useRideHailingStore();

  useEffect(() => {
    loadTimestamps();
  }, [loadTimestamps]);

  useEffect(() => {
    if (timestamps.length > 0) {
      console.log('Timestamps loaded:', timestamps);
    }
  }, [timestamps]);

  return <div>Debug Loader</div>;
}

export default DebugLoader;

