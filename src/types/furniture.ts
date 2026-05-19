export interface Part {
  id: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  material: string;
  color?: string;
  isEdgeBanded?: [boolean, boolean, boolean, boolean]; // top, right, bottom, left
}

export interface CabinetDimensions {
  width: number;
  height: number;
  depth: number;
  thickness: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  clientName: string;
  createdAt: number;
  updatedAt: number;
  items: CabinetItem[];
}

export interface CabinetItem {
  id: string;
  type: 'base' | 'wall' | 'closet' | 'custom' | 'shelving' | 'modern-shelf' | 'stepped-shelf';
  name: string;
  dimensions: CabinetDimensions;
  parts: Part[];
  shelfPositions?: number[]; // Heights from base for each shelf
  modernShelfWidths?: number[]; // Widths for modern shelf parts
  steppedShelfParams?: number[]; // Widths for cubes or tiers
}

export interface Sheet {
  id: string;
  width: number;
  height: number;
  thickness: number;
  type: 'full' | 'half';
}

export interface NestedPart extends Part {
  x: number;
  y: number;
  rotated: boolean;
}

export interface CuttingPlan {
  sheet: Sheet;
  nestedParts: NestedPart[];
  usage: number; // percentage
}
