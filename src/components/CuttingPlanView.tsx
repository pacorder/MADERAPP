import React from 'react';
import { CuttingPlan, NestedPart } from '../types/furniture';

interface CuttingPlanProps {
  plan: CuttingPlan;
}

export const CuttingPlanView: React.FC<CuttingPlanProps> = ({ plan }) => {
  const { sheet, nestedParts, usage } = plan;
  
  // Scale factor to fit the view
  const scale = 0.25; 
  
  return (
    <div className="cutting-plan-export-target flex flex-col gap-4 p-6 border border-natural-border rounded-[2rem] bg-white shadow-sm overflow-hidden">
      <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.15em] text-natural-secondary">
        <span>Plancha {sheet.width}x{sheet.height}mm</span>
        <div className="flex items-center gap-2">
           <span className="text-natural-primary">{usage.toFixed(1)}% Optimización</span>
           <div className={`w-3 h-3 rounded-full ${usage > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
      </div>
      
      <div 
        className="relative bg-natural-muted/50 border-2 border-natural-divider mx-auto rounded-lg overflow-hidden"
        style={{ 
          width: sheet.width * scale, 
          height: sheet.height * scale,
          maxWidth: '100%',
          aspectRatio: `${sheet.width} / ${sheet.height}`
        }}
      >
        {nestedParts.map((part, i) => (
          <div
            key={i}
            className="absolute border border-white/50 bg-natural-primary/80 flex items-center justify-center overflow-hidden hover:bg-natural-primary transition-all cursor-help group"
            style={{
              left: part.x * scale,
              top: part.y * scale,
              width: (part.rotated ? part.height : part.width) * scale,
              height: (part.rotated ? part.width : part.height) * scale,
              fontSize: '8px',
              padding: '2px'
            }}
            title={`${part.name}: ${part.width}x${part.height}`}
          >
            <span className="truncate text-white font-bold opacity-80 group-hover:opacity-100 text-[6px] uppercase tracking-tighter">
               {part.name}
            </span>
          </div>
        ))}
        {/* Sobrante pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#6B705C_1px,transparent_1px)] [background-size:10px_10px] z-0" />
      </div>
    </div>
  );
};
