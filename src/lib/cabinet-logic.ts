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

