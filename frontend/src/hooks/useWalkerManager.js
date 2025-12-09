import { useState, useCallback } from 'react';

/**
 * Walker manager hook - manages spawning and updating walkers
 */
export function useWalkerManager() {
  const [walkers, setWalkers] = useState([]);
  const nextIdRef = { current: 0 };

  const spawnWalker = useCallback((x, y) => {
    const id = nextIdRef.current++;
    setWalkers((prev) => [...prev, { id, x, y }]);
    return id;
  }, []);

  const removeWalker = useCallback((id) => {
    setWalkers((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWalkers = useCallback(() => {
    // Walkers update themselves via their own animation loops
    // This function can be used for global updates if needed
  }, []);

  const clearAllWalkers = useCallback(() => {
    setWalkers([]);
  }, []);

  return {
    walkers,
    spawnWalker,
    removeWalker,
    updateWalkers,
    clearAllWalkers,
  };
}

