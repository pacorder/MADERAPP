import { Part, Sheet, NestedPart, CuttingPlan } from '../types/furniture';

/**
 * A Guillotine-style bin packing algorithm for rectangular nesting.
 * It manages a list of free rectangles on the sheet to maximize material usage.
 */
export function optimizeNesting(parts: Part[], sheetDims: { width: number, height: number }): CuttingPlan[] {
  const kerf = 4; // Saw blade thickness
  const margin = 10; // Sheet edge safety margin
  
  // Flatten parts by quantity
  const flatParts: Part[] = [];
  parts.forEach(p => {
    for (let i = 0; i < p.quantity; i++) {
      flatParts.push({ ...p, quantity: 1 });
    }
  });

  // Sort parts by area (largest first) to define the layout early
  const sortedParts = [...flatParts].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    if (areaB !== areaA) return areaB - areaA;
    return Math.max(b.width, b.height) - Math.max(a.width, a.height);
  });

  const plans: CuttingPlan[] = [];
  let remainingParts = [...sortedParts];

  interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  while (remainingParts.length > 0) {
    const nestedParts: NestedPart[] = [];
    const freeRects: Rect[] = [
      { 
        x: margin, 
        y: margin, 
        w: sheetDims.width - 2 * margin, 
        h: sheetDims.height - 2 * margin 
      }
    ];
    
    let unplaced: Part[] = [];
    let placedInThisSheet = 0;

    // We process parts one by one and try to fit them into the current sheet
    for (const part of remainingParts) {
      let bestRectIdx = -1;
      let rotated = false;
      let minLeftoverArea = Infinity;

      // Find the best free rectangle for this part based on minimal leftover area
      for (let i = 0; i < freeRects.length; i++) {
        const rect = freeRects[i];
        
        // Try orientation 1
        if (part.width <= rect.w && part.height <= rect.h) {
          const leftover = (rect.w * rect.h) - (part.width * part.height);
          if (leftover < minLeftoverArea) {
            minLeftoverArea = leftover;
            bestRectIdx = i;
            rotated = false;
          }
        }
        
        // Try orientation 2 (rotated)
        if (part.height <= rect.w && part.width <= rect.h) {
          const leftover = (rect.w * rect.h) - (part.width * part.height);
          if (leftover < minLeftoverArea) {
            minLeftoverArea = leftover;
            bestRectIdx = i;
            rotated = true;
          }
        }
      }

      if (bestRectIdx !== -1) {
        const rect = freeRects.splice(bestRectIdx, 1)[0];
        const pw = rotated ? part.height : part.width;
        const ph = rotated ? part.width : part.height;

        nestedParts.push({ ...part, x: rect.x, y: rect.y, rotated });
        placedInThisSheet++;

        // Split the remaining space of the rectangle into two new free rectangles (Guillotine split)
        const wRem = rect.w - pw - kerf;
        const hRem = rect.h - ph - kerf;

        if (wRem > hRem) {
          // Split vertically - right rect is full height
          if (wRem > 0) {
            freeRects.push({ x: rect.x + pw + kerf, y: rect.y, w: wRem, h: rect.h });
          }
          if (hRem > 0) {
            freeRects.push({ x: rect.x, y: rect.y + ph + kerf, w: pw, h: hRem });
          }
        } else {
          // Split horizontally - bottom rect is full width
          if (hRem > 0) {
            freeRects.push({ x: rect.x, y: rect.y + ph + kerf, w: rect.w, h: hRem });
          }
          if (wRem > 0) {
            freeRects.push({ x: rect.x + pw + kerf, y: rect.y, w: wRem, h: ph });
          }
        }
        
        // Sort free rects by area to keep them somewhat organized
        freeRects.sort((a, b) => (a.w * a.h) - (b.w * b.h));
      } else {
        unplaced.push(part);
      }
    }

    if (placedInThisSheet > 0) {
      const totalSheetArea = sheetDims.width * sheetDims.height;
      const usedArea = nestedParts.reduce((sum, p) => sum + p.width * p.height, 0);
      
      plans.push({
        sheet: { id: crypto.randomUUID(), width: sheetDims.width, height: sheetDims.height, thickness: 15, type: 'full' },
        nestedParts,
        usage: (usedArea / totalSheetArea) * 100
      });
    } else {
      if (unplaced.length === remainingParts.length) {
        break;
      }
    }

    remainingParts = unplaced;
    if (plans.length > 100) break; 
  }

  return plans;
}
