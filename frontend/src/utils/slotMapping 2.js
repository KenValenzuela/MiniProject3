/**
 * Slot ID Remapping Utility
 * Maps backend slot_id values to display slot_id values based on visual position
 * Reading pattern: Specific layout matching user requirements
 * 
 * Target layout:
 * 1  4    13  16
 * 2  5    14  17
 * 3  6    15  18
 * 7  10   19  22
 * 8  11   20  23
 * 9  12   21  24
 * 
 * This ensures slot numbers read naturally while keeping all physical coordinates identical
 */

/**
 * Create a mapping from backend slot_id to display slot_id
 * Based on specific visual layout pattern:
 * - Sort by y (top to bottom) first to get rows
 * - Within each row, sort by x (left to right)
 * - Assign numbers in the specific pattern: 1-6, 13-18, 7-12, 19-24
 * 
 * @param {Array} slots - Array of slot objects with slot_id, x, y
 * @returns {Map} Mapping from backend slot_id to display slot_id (1-24)
 */
export function createSlotMapping(slots) {
  if (!slots || slots.length === 0) {
    return new Map();
  }

  // Group slots by approximate y position (rows) - allow 5px tolerance
  const rows = [];
  const processed = new Set();
  
  slots.forEach(slot => {
    if (processed.has(slot.slot_id)) return;
    
    // Find all slots in the same row (similar y coordinate)
    const rowSlots = slots.filter(s => 
      !processed.has(s.slot_id) && Math.abs(s.y - slot.y) <= 5
    );
    
    if (rowSlots.length > 0) {
      // Sort row by x (left to right)
      rowSlots.sort((a, b) => a.x - b.x);
      rows.push(rowSlots);
      rowSlots.forEach(s => processed.add(s.slot_id));
    }
  });
  
  // Sort rows by y (top to bottom)
  rows.sort((a, b) => a[0].y - b[0].y);
  
  // Target display order pattern:
  // Row 1: positions 1, 4, 13, 16
  // Row 2: positions 2, 5, 14, 17
  // Row 3: positions 3, 6, 15, 18
  // Row 4: positions 7, 10, 19, 22
  // Row 5: positions 8, 11, 20, 23
  // Row 6: positions 9, 12, 21, 24
  
  const targetPositions = [
    [1, 4, 13, 16],   // Row 1
    [2, 5, 14, 17],   // Row 2
    [3, 6, 15, 18],   // Row 3
    [7, 10, 19, 22],  // Row 4
    [8, 11, 20, 23],  // Row 5
    [9, 12, 21, 24],  // Row 6
  ];
  
  // Create mapping: backend slot_id -> display slot_id
  const mapping = new Map();
  
  rows.forEach((row, rowIndex) => {
    if (rowIndex < targetPositions.length) {
      const positions = targetPositions[rowIndex];
      row.forEach((slot, colIndex) => {
        if (colIndex < positions.length) {
          mapping.set(slot.slot_id, positions[colIndex]);
        }
      });
    }
  });

  return mapping;
}

/**
 * Get display slot_id for a given backend slot_id
 * @param {Map} mapping - Slot mapping from createSlotMapping
 * @param {number|string} backendSlotId - Original slot_id from backend
 * @returns {number} Display slot_id (1-24)
 */
export function getDisplaySlotId(mapping, backendSlotId) {
  return mapping.get(backendSlotId) || backendSlotId;
}

/**
 * Create reverse mapping: display slot_id -> backend slot_id
 * @param {Map} mapping - Forward mapping from createSlotMapping
 * @returns {Map} Reverse mapping
 */
export function createReverseMapping(mapping) {
  const reverse = new Map();
  mapping.forEach((displayId, backendId) => {
    reverse.set(displayId, backendId);
  });
  return reverse;
}

