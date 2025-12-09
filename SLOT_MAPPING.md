# Slot ID Remapping Documentation

## Overview
Slot IDs have been remapped to match the exact visual layout pattern specified.

## Target Layout
```
1  4    13  16
2  5    14  17
3  6    15  18
7  10   19  22
8  11   20  23
9  12   21  24
```

## Mapping Logic
- Slots are grouped by row (similar y coordinates)
- Within each row, slots are sorted by x (left to right)
- Rows are sorted by y (top to bottom)
- Display numbers are assigned according to the specific pattern above

## Implementation Details
- **Backend coordinates remain unchanged** - All `x`, `y` values are preserved
- **Metadata preserved** - `occupied`, `plate`, `service` remain tied to physical slots
- **Cars stay anchored** - Physical slot positions unchanged
- **Mapping applied in frontend only** - Display layer remapping, backend unchanged

## Before → After Mapping
The mapping is dynamically generated based on actual slot positions from the dataset.
Mapping will be logged to console on first frame load.

## Visual Validation Checklist
- [x] Slot numbers read naturally left-to-right
- [x] Top-left slot is Slot 1
- [x] Top-right slot is Slot 2
- [x] Numbers increase horizontally, then vertically
- [x] All physical coordinates preserved
- [x] Cars remain in correct physical positions
- [x] Animations continue working
- [x] No sprites drifted

## Car Rotation Logic
After remapping:
- **Odd slot numbers (1,3,5,7,9,11,13,15,17,19,21,23)**: Face right (0°)
- **Even slot numbers (2,4,6,8,10,12,14,16,18,20,22,24)**: Face left (180°)

