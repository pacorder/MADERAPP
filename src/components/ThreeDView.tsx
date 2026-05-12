import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei';
import { Part, CabinetDimensions } from '../types/furniture';

interface PartMeshProps {
  part: Part;
  position: [number, number, number];
  rotation?: [number, number, number];
}

const PartMesh: React.FC<PartMeshProps> = ({ part, position, rotation = [0, 0, 0] }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[part.width / 1000, part.height / 1000, part.thickness / 1000]} />
      <meshStandardMaterial color={part.material.includes('Delgado') ? '#E5E1D8' : '#D6CEBE'} roughness={0.4} metalness={0.1} />
    </mesh>
  );
};

interface FurnitureModelProps {
  type: string;
  dimensions: CabinetDimensions;
  parts: Part[];
  shelfPositions?: number[];
}

const FurnitureModel: React.FC<FurnitureModelProps> = ({ type, dimensions, parts, shelfPositions }) => {
  const { width, height, depth, thickness } = dimensions;
  const w = width / 1000;
  const h = height / 1000;
  const d = depth / 1000;
  const t = thickness / 1000;

  // Simple hardcoded positioning for demonstration
  // In a real app, this would be more dynamic based on part names or labels
  return (
    <group position={[0, h/2, 0]}>
      {parts.map(part => {
        if (part.name.includes('Lateral Izquierdo')) {
          return <PartMesh key={part.id} part={part} position={[-w/2 + t/2, 0, 0]} rotation={[0, Math.PI/2, 0]} />;
        }
        if (part.name.includes('Lateral Derecho')) {
          return <PartMesh key={part.id} part={part} position={[w/2 - t/2, 0, 0]} rotation={[0, Math.PI/2, 0]} />;
        }
        if (part.name === 'Base') {
          return <PartMesh key={part.id} part={part} position={[0, -h/2 + t/2, 0]} rotation={[Math.PI/2, 0, 0]} />;
        }
        if (part.name === 'Techo') {
          return <PartMesh key={part.id} part={part} position={[0, h/2 - t/2, 0]} rotation={[Math.PI/2, 0, 0]} />;
        }
        if (part.name === 'Amarre Superior Frontal') {
          return <PartMesh key={part.id} part={part} position={[0, h/2 - 0.05, d/2 - t/2]} rotation={[Math.PI/2, 0, 0]} />;
        }
        if (part.name === 'Amarre Superior Trasero') {
          return <PartMesh key={part.id} part={part} position={[0, h/2 - 0.05, -d/2 + t/2]} rotation={[Math.PI/2, 0, 0]} />;
        }
        if (part.name.includes('Fondo')) {
          return <PartMesh key={part.id} part={part} position={[0, 0, -d/2 + 0.003]} rotation={[0, 0, 0]} />;
        }
        if (part.name.includes('Estante')) {
          // If it's a shelving unit with multiple shelves, we need to distribute them
          if (type === 'shelving') {
            const shelfMatch = part.name.match(/Estante (\d+)/);
            if (shelfMatch) {
              const shelfIndex = parseInt(shelfMatch[1]) - 1;
              
              let shelfY;
              if (shelfPositions && shelfPositions[shelfIndex] !== undefined) {
                // shelfPositions are heights from base (where base top surface is -h/2 + t)
                shelfY = (-h/2 + t) + (shelfPositions[shelfIndex] / 1000);
              } else {
                const numShelves = parts.filter(p => p.name.includes('Estante')).length;
                // Distribute shelves vertically
                const sectionHeight = (h - 2*t) / (numShelves + 1);
                shelfY = (-h/2 + t) + (shelfIndex + 1) * sectionHeight;
              }
              return <PartMesh key={part.id} part={part} position={[0, shelfY, 0]} rotation={[Math.PI/2, 0, 0]} />;
            }
          }
          return <PartMesh key={part.id} part={part} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]} />;
        }
        return null;
      })}
    </group>
  );
};

export const ThreeDView: React.FC<FurnitureModelProps> = (props) => {
  return (
    <div className="w-full h-[400px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
      <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[1.5, 1.5, 1.5]} />
          <Stage environment="city" intensity={0.6}>
            <FurnitureModel {...props} />
          </Stage>
          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
};
