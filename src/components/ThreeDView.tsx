import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Part, CabinetDimensions } from '../types/furniture';

interface PartMeshProps {
  part: Part;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  isAssembly?: boolean;
}

const PartMesh: React.FC<PartMeshProps> = ({ part, position, rotation = [0, 0, 0], color = '#D6CEBE', isAssembly }) => {
  // Use the provided color, but keep the thin parts slightly different or tinted
  const isThin = part.material.includes('Delgado');
  const finalColor = isThin ? '#E5E1D8' : color;

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[part.width / 1000, part.height / 1000, part.thickness / 1000]} />
      {isAssembly ? (
        <meshStandardMaterial 
          color="#000000" 
          wireframe={true} 
          transparent={true} 
          opacity={0.1} 
        />
      ) : (
        <meshStandardMaterial color={finalColor} roughness={0.4} metalness={0.1} />
      )}
      {isAssembly && <Edges color="black" threshold={15} />}
    </mesh>
  );
};

interface FurnitureModelProps {
  type: string;
  dimensions: CabinetDimensions;
  parts: Part[];
  shelfPositions?: number[];
  finishColor?: string;
  isAssembly?: boolean;
}

const FurnitureModel: React.FC<FurnitureModelProps> = ({ type, dimensions, parts, shelfPositions, finishColor, isAssembly }) => {
  const { width, height, depth, thickness } = dimensions;
  const w = width / 1000;
  const h = height / 1000;
  const d = depth / 1000;
  const t = thickness / 1000;
  const ph = 0.08; // Plinth height (80mm)

  return (
    <group position={[0, h/2, 0]}>
      {parts.map(part => {
        if (part.name.includes('Lateral Izquierdo')) {
          return <PartMesh key={part.id} part={part} position={[-w/2 + t/2, 0, 0]} rotation={[0, Math.PI/2, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name.includes('Lateral Derecho')) {
          return <PartMesh key={part.id} part={part} position={[w/2 - t/2, 0, 0]} rotation={[0, Math.PI/2, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name === 'Base') {
          const y = (type === 'shelving') ? (-h/2 + ph + t/2) : (-h/2 + t/2);
          return <PartMesh key={part.id} part={part} position={[0, y, 0]} rotation={[Math.PI/2, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name === 'Techo') {
          return <PartMesh key={part.id} part={part} position={[0, h/2 - t/2, 0]} rotation={[Math.PI/2, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name === 'Zócalo Frontal') {
          return <PartMesh key={part.id} part={part} position={[0, -h/2 + ph/2, d/2 - t - 0.02]} rotation={[0, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name === 'Zócalo Trasero') {
          return <PartMesh key={part.id} part={part} position={[0, -h/2 + ph/2, -d/2 + t + 0.02]} rotation={[0, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name === 'Amarre Superior Frontal') {
          return <PartMesh key={part.id} part={part} position={[0, h/2 - 0.05, d/2 - t/2]} rotation={[Math.PI/2, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name === 'Amarre Superior Trasero') {
          return <PartMesh key={part.id} part={part} position={[0, h/2 - 0.05, -d/2 + t/2]} rotation={[Math.PI/2, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name.includes('Fondo')) {
          return <PartMesh key={part.id} part={part} position={[0, 0, -d/2 + 0.003]} rotation={[0, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        if (part.name.includes('Estante')) {
          if (type === 'shelving') {
            const shelfMatch = part.name.match(/Estante (\d+)/);
            if (shelfMatch) {
              const shelfIndex = parseInt(shelfMatch[1]) - 1;
              
              let shelfY;
              if (shelfPositions && shelfPositions[shelfIndex] !== undefined) {
                // shelfPositions are heights from base plate top surface
                // base top surface is at -h/2 + ph + t
                shelfY = (-h/2 + ph + t) + (shelfPositions[shelfIndex] / 1000);
              } else {
                const numShelves = parts.filter(p => p.name.includes('Estante')).length;
                // Distribute shelves vertically in the space between base and ceiling
                const sectionHeight = (h - 2*t - ph) / (numShelves + 1);
                shelfY = (-h/2 + ph + t) + (shelfIndex + 1) * sectionHeight;
              }
              return <PartMesh key={part.id} part={part} position={[0, shelfY, 0]} rotation={[Math.PI/2, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
            }
          }
          return <PartMesh key={part.id} part={part} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]} color={finishColor} isAssembly={isAssembly} />;
        }
        return null;
      })}
    </group>
  );
};

export const ThreeDView: React.FC<FurnitureModelProps> = (props) => {
  return (
    <div className="w-full h-[700px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
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
