import { Part, Sheet, NestedPart, CuttingPlan } from '../types/furniture';

/**
 * A simple Guillotine-style bin packing algorithm for rectangular nesting.
 */
export function optimizeNesting(parts: Part[], sheetDims: { width: number, height: number }): CuttingPlan[] {
  // Flatten parts by quantity
  const flatParts: Part[] = [];
  parts.forEach(p => {
    for (let i = 0; i < p.quantity; i++) {
      flatParts.push({ ...p, quantity: 1 });
    }
  });

  // Sort parts by area (largest first)
  const sortedParts = [...flatParts].sort((a, b) => (b.width * b.height) - (a.width * a.height));

  const plans: CuttingPlan[] = [];
  let remainingParts = [...sortedParts];

  while (remainingParts.length > 0) {
    const nestedParts: NestedPart[] = [];
    let currentX = 0;
    let currentY = 0;
    let shelfHeight = 0;
    
    const unplacedOnThisSheet: Part[] = [];
    const sheetWidth = sheetDims.width;
    const sheetHeight = sheetDims.height;

    for (const part of remainingParts) {
      let placed = false;
      
      // Try normal
      if (currentX + part.width <= sheetWidth && currentY + part.height <= sheetHeight) {
        nestedParts.push({ ...part, x: currentX, y: currentY, rotated: false });
        currentX += part.width + 5; // 5mm kerf (saw cut width)
        shelfHeight = Math.max(shelfHeight, part.height);
        placed = true;
      } 
      // Try rotated
      else if (currentX + part.height <= sheetWidth && currentY + part.width <= sheetHeight) {
        nestedParts.push({ ...part, x: currentX, y: currentY, rotated: true });
        currentX += part.height + 5;
        shelfHeight = Math.max(shelfHeight, part.width);
        placed = true;
      }
      // Try next shelf
      else {
        currentY += shelfHeight + 5;
        currentX = 0;
        shelfHeight = 0;
        
        if (currentY + part.height <= sheetHeight && currentX + part.width <= sheetWidth) {
          nestedParts.push({ ...part, x: currentX, y: currentY, rotated: false });
          currentX += part.width + 5;
          shelfHeight = Math.max(shelfHeight, part.height);
          placed = true;
        } else if (currentY + part.width <= sheetHeight && currentX + part.height <= sheetWidth) {
          nestedParts.push({ ...part, x: currentX, y: currentY, rotated: true });
          currentX += part.height + 5;
          shelfHeight = Math.max(shelfHeight, part.width);
          placed = true;
        }
      }

      if (!placed) {
        unplacedOnThisSheet.push(part);
      }
    }

    const totalSheetArea = sheetWidth * sheetHeight;
    const usedArea = nestedParts.reduce((sum, p) => sum + p.width * p.height, 0);
    
    plans.push({
      sheet: { id: crypto.randomUUID(), width: sheetWidth, height: sheetHeight, thickness: 15, type: 'full' },
      nestedParts,
      usage: (usedArea / totalSheetArea) * 100
    });

    remainingParts = unplacedOnThisSheet;
    
    // Safety break for testing
    if (plans.length > 20) break; 
  }

  return plans;
}
