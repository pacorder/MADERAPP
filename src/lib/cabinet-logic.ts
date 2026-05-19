import { Part, CabinetDimensions, CabinetItem } from '../types/furniture';

export function calculateBaseCabinetParts(dims: CabinetDimensions): Part[] {
  const { width, height, depth, thickness } = dims;
  
  return [
    {
      id: crypto.randomUUID(),
      name: 'Lateral Izquierdo',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Lateral Derecho',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Base',
      width: width - 2 * thickness,
      height: depth,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Amarre Superior Frontal',
      width: width - 2 * thickness,
      height: 100,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Amarre Superior Trasero',
      width: width - 2 * thickness,
      height: 100,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Fondo (trasera)',
      width: width - 5,
      height: height - 5,
      thickness: 3,
      quantity: 1,
      material: 'MDF Delgado',
    },
  ];
}

export function calculateWallCabinetParts(dims: CabinetDimensions): Part[] {
  const { width, height, depth, thickness } = dims;
  
  return [
    {
      id: crypto.randomUUID(),
      name: 'Lateral Izquierdo',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Lateral Derecho',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Techo',
      width: width - 2 * thickness,
      height: depth,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Base',
      width: width - 2 * thickness,
      height: depth,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Estante',
      width: width - 2 * thickness - 2,
      height: depth - 20,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Fondo (trasera)',
      width: width - 5,
      height: height - 5,
      thickness: 3,
      quantity: 1,
      material: 'MDF Delgado',
    },
  ];
}

export function calculateShelvingParts(dims: CabinetDimensions, numShelvesOrPositions: number | number[] = 3): Part[] {
  const { width, height, depth, thickness } = dims;
  const plinthHeight = 80; // Standard zócalo height

  const parts: Part[] = [
    {
      id: crypto.randomUUID(),
      name: 'Lateral Izquierdo',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Lateral Derecho',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Techo',
      width: width - 2 * thickness,
      height: depth,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Base',
      width: width - 2 * thickness,
      height: depth,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Zócalo Frontal',
      width: width - 2 * thickness,
      height: plinthHeight,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
    {
      id: crypto.randomUUID(),
      name: 'Zócalo Trasero',
      width: width - 2 * thickness,
      height: plinthHeight,
      thickness,
      quantity: 1,
      material: 'MDF',
    },
  ];

  const positions = Array.isArray(numShelvesOrPositions) 
    ? numShelvesOrPositions 
    : Array.from({ length: numShelvesOrPositions }).map((_, i) => 
        Math.round(((height - 2 * thickness - plinthHeight) / (numShelvesOrPositions + 1)) * (i + 1))
      );

  // Internal shelves
  positions.forEach((pos, i) => {
    parts.push({
      id: crypto.randomUUID(),
      name: `Estante ${i + 1}`,
      width: width - 2 * thickness - 2,
      height: depth - 20,
      thickness,
      quantity: 1,
      material: 'MDF',
    });
  });

  // Backing
  parts.push({
    id: crypto.randomUUID(),
    name: 'Fondo (trasera)',
    width: width - 5,
    height: height - 5,
    thickness: 3,
    quantity: 1,
    material: 'MDF Delgado',
  });

  return parts;
}

export function calculateModernShelfParts(dims: CabinetDimensions, customWidths?: number[]): Part[] {
  const { width, height, depth, thickness } = dims;
  
  // Custom widths/heights order: [Lateral Derecho Parcial Height, Techo Parcial Width, Repisa 1 Width, Repisa 2 Width]
  // Default values if not provided
  const ldpHeight = customWidths?.[0] || height * 0.75;
  const tpWidth = customWidths?.[1] || 500;
  const r1Width = customWidths?.[2] || 500;
  const r2Width = customWidths?.[3] || 500;

  // The vertical back support takes 'thickness' from the depth
  const shelfDepth = depth - thickness;

  return [
    {
      id: crypto.randomUUID(),
      name: 'Lateral Moderno Izquierdo',
      width: depth,
      height: height,
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
    {
      id: crypto.randomUUID(),
      name: 'Refuerzo Trasero Vertical',
      width: 200, 
      height: height,
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
    {
      id: crypto.randomUUID(),
      name: 'Base Moderna',
      width: width - thickness,
      height: shelfDepth,
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
    {
      id: crypto.randomUUID(),
      name: 'Lateral Moderno Derecho Parcial',
      width: shelfDepth,
      height: ldpHeight - thickness, // Sits on base
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
    {
      id: crypto.randomUUID(),
      name: 'Techo Moderno Parcial',
      width: tpWidth - thickness, // Fits between left lateral
      height: shelfDepth,
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
    {
      id: crypto.randomUUID(),
      name: 'Repisa 1',
      width: r1Width - thickness,
      height: shelfDepth,
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
    {
      id: crypto.randomUUID(),
      name: 'Repisa 2',
      width: r2Width - thickness,
      height: shelfDepth,
      thickness,
      quantity: 1,
      material: 'Madera Natural',
    },
  ];
}

export function calculateSteppedShelfParts(dims: CabinetDimensions, customParams?: number[]): Part[] {
  const { width, height, depth, thickness } = dims;
  
  // Params order: [Col 1 Width, Col 2 Width, Col 3 Width, Tier 1 Height, Tier 2 Height, Tier 3 Height]
  const c1W = customParams?.[0] || (width - 4 * thickness) / 3;
  const c2W = customParams?.[1] || (width - 4 * thickness) / 3;
  const c3W = customParams?.[2] || (width - 4 * thickness) / 3;
  
  const h1H = customParams?.[3] || (height - 4 * thickness) / 3;
  const h2H = customParams?.[4] || (height - 4 * thickness) / 3;
  const h3H = customParams?.[5] || (height - 4 * thickness) / 3;
  
  const parts: Part[] = [];
  
  // Horizontals
  // Base (Under everything)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Base Escalinata',
    width: width,
    height: depth,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // Level 1 Horizontal (Top of row 1, covers all 3 columns)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Repisa Escalinata L1',
    width: width - 2 * thickness,
    height: depth,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // Level 2 Horizontal (Top of row 2, covers 2 columns)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Repisa Escalinata L2',
    width: c1W + c2W + thickness,
    height: depth,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // Level 3 Horizontal (Top of row 3, covers 1 column)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Techo Escalinata',
    width: c1W,
    height: depth,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // Verticals
  const totalH = h1H + h2H + h3H + 4 * thickness;

  // V0: Far Left (Full height)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Lateral Escalinata V0',
    width: depth,
    height: totalH,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // V1: Divider between Col 1 and 2 (Full height)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Lateral Escalinata V1',
    width: depth,
    height: totalH,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // V2: Divider between Col 2 and 3 (2 tiers high)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Lateral Escalinata V2',
    width: depth,
    height: h1H + h2H + 3 * thickness,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  // V3: Far Right (1 tier high)
  parts.push({
    id: crypto.randomUUID(),
    name: 'Lateral Escalinata V3',
    width: depth,
    height: h1H + 2 * thickness,
    thickness,
    quantity: 1,
    material: 'Madera Natural',
  });
  
  return parts;
}

