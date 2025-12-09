import { useMemo } from 'react';

// Available car sprites
const CAR_SPRITES = [
  '/car_sprites/Audi.png',
  '/car_sprites/Car.png',
  '/car_sprites/Mini_truck.png',
  '/car_sprites/Mini_van.png',
  '/car_sprites/taxi.png',
  '/car_sprites/truck.png',
];

// Map to store plate -> car sprite assignments (consistent per plate)
const plateToCarSprite = new Map();

/**
 * Get a consistent car sprite for a given plate number
 * Uses a simple hash to ensure same plate always gets same sprite
 */
function getCarSpriteForPlate(plate) {
  if (!plate) return CAR_SPRITES[0];
  
  if (!plateToCarSprite.has(plate)) {
    // Simple hash function to consistently assign sprite
    let hash = 0;
    for (let i = 0; i < plate.length; i++) {
      hash = ((hash << 5) - hash) + plate.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    const spriteIndex = Math.abs(hash) % CAR_SPRITES.length;
    plateToCarSprite.set(plate, CAR_SPRITES[spriteIndex]);
  }
  
  return plateToCarSprite.get(plate);
}

/**
 * Get plate image path, or return null if not found
 */
function getPlateImagePath(plate) {
  if (!plate) return null;
  return `/plates/${plate}.png`;
}

/**
 * CarSprite component for rendering vehicle sprites at exact backend coordinates
 * Uses canonical x, y positions without any scaling or transformation
 * Renders real car sprites and plate images
 * Rotates cars to match slot orientation
 */
function CarSprite({ x, y, plate, service, occupied, slot_id }) {
  // Don't render if slot is not occupied
  if (!occupied) {
    return null;
  }

  // Get car sprite for this plate
  const carSprite = useMemo(() => getCarSpriteForPlate(plate), [plate]);
  
  // Get plate image path
  const plateImagePath = getPlateImagePath(plate);

  // Calculate rotation - cars rotated 90 degrees to face up/down
  // Based on display slot_id (after remapping to visual position)
  // 
  // Visual layout:
  // 1  4    13  16
  // 2  5    14  17
  // 3  6    15  18
  // 7  10   19  22
  // 8  11   20  23
  // 9  12   21  24
  // 
  // Left columns: 1,2,3,7,8,9,13,14,15,19,20,21 (face up = 90deg)
  // Right columns: 4,5,6,10,11,12,16,17,18,22,23,24 (face down = 270deg)
  const rotation = useMemo(() => {
    if (slot_id) {
      const slotNum = typeof slot_id === 'string' ? parseInt(slot_id) || 0 : slot_id;
      // Left columns: positions 1,2,3,7,8,9,13,14,15,19,20,21
      // Right columns: positions 4,5,6,10,11,12,16,17,18,22,23,24
      const leftColumnSlots = [1, 2, 3, 7, 8, 9, 13, 14, 15, 19, 20, 21];
      if (leftColumnSlots.includes(slotNum)) {
        return 90; // Face up (left columns) - rotated 90 degrees from original
      } else {
        return 270; // Face down (right columns) - rotated 90 degrees from original
      }
    }
    return 90; // Default to facing up
  }, [slot_id]);

  // Position car consistently centered in the slot - STANDARDIZED FOR ALL SLOTS
  // Car is larger (60px x 60px)
  // Use EXACT same offsets for all slots to ensure all cars are on the same level
  const carWidth = 60;
  const carHeight = 60;
  
  // STANDARDIZED positioning: All cars use identical offset calculations
  // Center car on slot coordinates (x, y) with consistent offset
  // The slot (x, y) represents the center point of the slot
  // Shift up by a standardized amount - same for ALL slots
  const carOffsetX = -carWidth / 2; // Center horizontally on slot x - STANDARDIZED
  const carOffsetY = -carHeight / 2 - 90; // Center vertically on slot y, shift up 90px - STANDARDIZED FOR ALL CARS

  return (
    <>
      {/* Car sprite with rotation - STANDARDIZED positioning for all slots */}
      {/* No license plates - only cars are shown */}
      {/* ALL cars use IDENTICAL offset calculation - ensures all cars are on the same level */}
      <img
        src={carSprite}
        alt={`Car ${plate || 'unknown'}`}
        style={{
          position: 'absolute',
          width: `${carWidth}px`,
          height: `${carHeight}px`,
          // STANDARDIZED positioning: All cars use exact same calculation
          // x + carOffsetX ensures horizontal centering (same for all)
          // y + carOffsetY ensures vertical alignment at same level (same for all)
          left: `${x + carOffsetX}px`,
          top: `${y + carOffsetY}px`,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          transition: 'left 0.45s ease-out, top 0.45s ease-out, transform 0.45s ease-out',
          willChange: 'left, top, transform',
          pointerEvents: 'auto',
          zIndex: 10,
        }}
      />
    </>
  );
}

export default CarSprite;
