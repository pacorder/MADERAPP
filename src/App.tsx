/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  Layout, 
  Trash2, 
  FileText, 
  Box, 
  Settings2,
  Dna,
  Maximize2,
  Rows,
  ArrowRight,
  LayoutPanelTop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Project, 
  CabinetItem, 
  CabinetDimensions, 
  Part, 
  CuttingPlan 
} from './types/furniture';
import { 
  calculateBaseCabinetParts, 
  calculateWallCabinetParts, 
  calculateShelvingParts, 
  calculateModernShelfParts,
  calculateSteppedShelfParts
} from './lib/cabinet-logic';
import { optimizeNesting } from './lib/nesting-logic';
import { ThreeDView } from './components/ThreeDView';
import { CuttingPlanView } from './components/CuttingPlanView';
import { exportToPDF } from './lib/pdf-service';
import { Toaster, toast } from 'sonner';
import html2canvas from 'html2canvas';

// shadcn UI component imports
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';

const DEFAULT_DIMENSIONS: CabinetDimensions = {
  width: 600,
  height: 720,
  depth: 580,
  thickness: 15
};

const MDF_SHEET_FULL = { width: 2500, height: 1830 };
const MDF_SHEET_HALF = { width: 1250, height: 1830 };

const SHEET_TYPES = [
  { id: 'full', label: 'Plancha Completa (2500x1830)', dims: MDF_SHEET_FULL },
  { id: 'half', label: 'Media Plancha (1250x1830)', dims: MDF_SHEET_HALF },
];

export default function App() {
  const [view, setView] = useState<'landing' | 'about' | 'app'>('landing');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'despiece' | 'cortex' | 'assembly'>('editor');
  const [selectedSheetType, setSelectedSheetType] = useState<'full' | 'half'>('full');
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  const FINISH_COLORS = [
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Roble', hex: '#B8977E' },
    { name: 'Cerezo', hex: '#93441A' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Maroon', hex: '#800000' },
  ];

  // Initialization
  useEffect(() => {
    // Demo project
    const demo: Project = {
      id: crypto.randomUUID(),
      userId: 'demo',
      name: 'Cocina Departemento A',
      clientName: 'Juan Perez',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: []
    };
    setCurrentProject(demo);
  }, []);

  const handleCreateProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      userId: 'demo',
      name: 'Nuevo Proyecto',
      clientName: 'Cliente Nuevo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: []
    };
    setCurrentProject(newProject);
    toast.success('Proyecto creado');
  };

  const handleAddItem = (type: CabinetItem['type']) => {
    if (!currentProject) return;

    let parts: Part[] = [];
    let name = '';
    
    if (type === 'wall') {
      parts = calculateWallCabinetParts(DEFAULT_DIMENSIONS);
      name = 'Mueble Aéreo';
    } else if (type === 'shelving') {
      const shelvingDims = { ...DEFAULT_DIMENSIONS, height: 1800, depth: 300 };
      const shelfPositions = [400, 750, 1100, 1450]; // Default heights
      parts = calculateShelvingParts(shelvingDims, shelfPositions);
      name = 'Estantería / Librero';
      
      const newItem: CabinetItem = {
        id: crypto.randomUUID(),
        type,
        name: `${name} ${currentProject.items.length + 1}`,
        dimensions: shelvingDims,
        parts,
        shelfPositions
      };

      const updated = {
        ...currentProject,
        items: [...currentProject.items, newItem],
        updatedAt: Date.now()
      };
      
      updateCurrentProject(updated);
      return;
    } else if (type === 'modern-shelf') {
      const modernDims = { width: 680, height: 1200, depth: 290, thickness: 15 };
      const defaultWidths = [
        1200 * 0.75, // Lateral Derecho Parcial
        500,         // Techo Parcial
        500,         // Repisa 1
        500          // Repisa 2
      ];
      parts = calculateModernShelfParts(modernDims, defaultWidths);
      name = 'Estante Moderno ZigZag';
      
      const newItem: CabinetItem = {
        id: crypto.randomUUID(),
        type,
        name: `${name} ${currentProject.items.length + 1}`,
        dimensions: modernDims,
        parts,
        modernShelfWidths: defaultWidths
      };

      const updated = {
        ...currentProject,
        items: [...currentProject.items, newItem],
        updatedAt: Date.now()
      };
      
      updateCurrentProject(updated);
      return;
    } else if (type === 'stepped-shelf') {
      const steppedDims = { width: 900, height: 900, depth: 300, thickness: 15 };
      const defaultParams = [
        (900 - 4 * 15) / 3, // Col 1
        (900 - 4 * 15) / 3, // Col 2
        (900 - 4 * 15) / 3, // Col 3
        (900 - 4 * 15) / 3, // Tier 1
        (900 - 4 * 15) / 3, // Tier 2
        (900 - 4 * 15) / 3  // Tier 3
      ];
      parts = calculateSteppedShelfParts(steppedDims, defaultParams);
      name = 'Estante Escalinata';
      
      const newItem: CabinetItem = {
        id: crypto.randomUUID(),
        type,
        name: `${name} ${currentProject.items.length + 1}`,
        dimensions: steppedDims,
        parts,
        steppedShelfParams: defaultParams
      };

      const updated = {
        ...currentProject,
        items: [...currentProject.items, newItem],
        updatedAt: Date.now()
      };
      
      updateCurrentProject(updated);
      return;
    }

    const newItem: CabinetItem = {
      id: crypto.randomUUID(),
      type,
      name: `${name} ${currentProject.items.length + 1}`,
      dimensions: { ...DEFAULT_DIMENSIONS },
      parts
    };

    const updated = {
      ...currentProject,
      items: [...currentProject.items, newItem],
      updatedAt: Date.now()
    };
    
    updateCurrentProject(updated);
  };

  const updateCurrentProject = (updated: Project) => {
    setCurrentProject(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (!currentProject) return;
    const updated = {
      ...currentProject,
      items: currentProject.items.filter(item => item.id !== id),
      updatedAt: Date.now()
    };
    updateCurrentProject(updated);
  };

  const handleUpdateItemDimensions = (itemId: string, dims: Partial<CabinetDimensions>) => {
    if (!currentProject) return;
    
    const updatedItems = currentProject.items.map(item => {
      if (item.id === itemId) {
        const newDims = { ...item.dimensions, ...dims };
        let newParts = item.parts;
        if (item.type === 'base') newParts = calculateBaseCabinetParts(newDims);
        if (item.type === 'wall') newParts = calculateWallCabinetParts(newDims);
        if (item.type === 'shelving') {
          // Keep the same number of shelves as before
          const positions = item.shelfPositions || [];
          newParts = calculateShelvingParts(newDims, positions);
        }
        if (item.type === 'modern-shelf') {
          newParts = calculateModernShelfParts(newDims, item.modernShelfWidths);
        }
        if (item.type === 'stepped-shelf') {
          newParts = calculateSteppedShelfParts(newDims, item.steppedShelfParams);
        }
        
        return {
          ...item,
          dimensions: newDims,
          parts: newParts
        };
      }
      return item;
    });

    updateCurrentProject({ ...currentProject, items: updatedItems, updatedAt: Date.now() });
  };

  const handleUpdateShelfPosition = (itemId: string, index: number, position: number) => {
    if (!currentProject) return;
    const updatedItems = currentProject.items.map(item => {
      if (item.id === itemId && item.shelfPositions) {
        const newPositions = [...item.shelfPositions];
        newPositions[index] = position;
        const newParts = calculateShelvingParts(item.dimensions, newPositions);
        return { ...item, shelfPositions: newPositions, parts: newParts };
      }
      return item;
    });
    updateCurrentProject({ ...currentProject, items: updatedItems, updatedAt: Date.now() });
  };

  const handleAddShelf = (itemId: string) => {
    if (!currentProject) return;
    const plinthHeight = 80;
    const updatedItems = currentProject.items.map(item => {
      if (item.id === itemId) {
        const currentPositions = item.shelfPositions || [];
        const lastPos = currentPositions.length > 0 ? currentPositions[currentPositions.length - 1] : 0;
        const maxPos = item.dimensions.height - 2 * item.dimensions.thickness - plinthHeight - 50; // 50mm safety margin
        const nextPos = lastPos + 300;
        const newPos = Math.min(nextPos, maxPos);
        
        // Only add if it's not overlapping too much with the last one or exceeds max
        if (newPos > lastPos + 10 && newPos <= maxPos) {
          const newPositions = [...currentPositions, newPos].sort((a, b) => a - b);
          const newParts = calculateShelvingParts(item.dimensions, newPositions);
          return { ...item, shelfPositions: newPositions, parts: newParts };
        }
      }
      return item;
    });
    updateCurrentProject({ ...currentProject, items: updatedItems, updatedAt: Date.now() });
  };

  const handleRemoveShelf = (itemId: string, index: number) => {
    if (!currentProject) return;
    const updatedItems = currentProject.items.map(item => {
      if (item.id === itemId && item.shelfPositions) {
        const newPositions = item.shelfPositions.filter((_, i) => i !== index);
        const newParts = calculateShelvingParts(item.dimensions, newPositions);
        return { ...item, shelfPositions: newPositions, parts: newParts };
      }
      return item;
    });
    updateCurrentProject({ ...currentProject, items: updatedItems, updatedAt: Date.now() });
  };

  const handleUpdateSteppedParam = (itemId: string, index: number, value: number) => {
    if (!currentProject) return;
    const updatedItems = currentProject.items.map(item => {
      if (item.id === itemId && item.steppedShelfParams) {
        const newParams = [...item.steppedShelfParams];
        newParams[index] = value;
        const newParts = calculateSteppedShelfParts(item.dimensions, newParams);
        return { ...item, steppedShelfParams: newParams, parts: newParts };
      }
      return item;
    });
    updateCurrentProject({ ...currentProject, items: updatedItems, updatedAt: Date.now() });
  };

  const handleUpdateModernWidth = (itemId: string, index: number, value: number) => {
    if (!currentProject) return;
    const updatedItems = currentProject.items.map(item => {
      if (item.id === itemId && item.modernShelfWidths) {
        const newWidths = [...item.modernShelfWidths];
        newWidths[index] = value;
        const newParts = calculateModernShelfParts(item.dimensions, newWidths);
        return { ...item, modernShelfWidths: newWidths, parts: newParts };
      }
      return item;
    });
    updateCurrentProject({ ...currentProject, items: updatedItems, updatedAt: Date.now() });
  };

  const allParts = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.items.flatMap(item => item.parts);
  }, [currentProject]);

  const cuttingPlans = useMemo(() => {
    if (allParts.length === 0) return [];
    const sheetDims = SHEET_TYPES.find(s => s.id === selectedSheetType)?.dims || MDF_SHEET_FULL;
    return optimizeNesting(allParts, sheetDims);
  }, [allParts, selectedSheetType]);

  const handleExport = async () => {
    if (!currentProject) return;
    
    const toastId = toast.loading('Preparando reporte y capturando imágenes...');
    
    try {
      // 1. Capture 3D Canvas
      const canvas3d = document.querySelector('canvas');
      const threeDImage = canvas3d?.toDataURL('image/png');

      // 2. Capture Cutting Plans
      // We need to be on the 'cortex' tab to see the elements, or they might be in the DOM if Tabs doesn't unmount
      const planImages: string[] = [];
      const planElements = document.querySelectorAll('.cutting-plan-export-target');
      
      if (planElements.length === 0 && cuttingPlans.length > 0) {
        toast.error('Por favor, navegue a la pestaña de Optimización antes de exportar para incluir los planos.', { id: toastId });
        // Still export without plans if user prefers, but maybe just return for now to ensure quality
        // return; 
      }

      for (const el of Array.from(planElements)) {
        const canvas = await html2canvas(el as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
        });
        planImages.push(canvas.toDataURL('image/png'));
      }

      await exportToPDF(currentProject, cuttingPlans, threeDImage, planImages);
      toast.success('Reporte generado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error during export:', error);
      toast.error('Error al generar el PDF. Intente nuevamente.', { id: toastId });
    }
  };

  if (view === 'about') {
    return (
      <div className="min-h-screen bg-natural-muted font-sans flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-natural-divider px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-12 h-12 bg-white border-2 border-natural-primary rounded-2xl flex items-center justify-center shadow-md">
              <Box className="w-7 h-7 text-natural-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic text-natural-primary tracking-tighter leading-none">CORTEX</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary -mt-0.5">Quiénes Somos</p>
            </div>
          </div>
          <nav className="flex items-center gap-10">
            <button onClick={() => setView('landing')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary transition-colors">Inicio</button>
            <button onClick={() => setView('app')} className="px-6 py-2.5 bg-natural-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Ir al Optimizador</button>
          </nav>
        </header>

        <main className="pt-48 pb-20 px-10 flex-1">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-natural-primary leading-tight italic tracking-tighter">Pasión por la madera y la <span className="text-natural-accent">tecnología</span>.</h2>
              <p className="text-xl text-natural-secondary font-medium leading-relaxed">
                Mi nombre es un reflejo de miles de apasionados que, como tú, ven en un trozo de madera una oportunidad para crear algo eterno. Cortex nació de la necesidad de cerrar la brecha entre la carpintería artesanal y las herramientas digitales modernas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-xl font-black italic text-natural-primary uppercase">Nuestra Misión</h3>
                <p className="text-natural-secondary leading-relaxed">
                  Busco democratizar el acceso a herramientas de alta precisión. Mi objetivo es que cada diseñador y carpintero, independientemente de su escala de producción, pueda aprovechar el modelamiento 3D y los algoritmos de nesting para llevar su imaginación al límite sin preocuparse por el desperdicio de material.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black italic text-natural-primary uppercase">Comunidad Primero</h3>
                <p className="text-natural-secondary leading-relaxed">
                  Cortex no es solo software; es una herramienta pensada para y por la comunidad. Me encanta ver cómo los usuarios sacan el mayor provecho a sus ideas, transformando simples diagramas en muebles con alma que habitan hogares reales.
                </p>
              </div>
            </div>

            <div className="p-12 bg-white rounded-[3rem] border border-natural-border shadow-xl space-y-8">
              <h3 className="text-2xl font-black italic text-natural-primary uppercase tracking-tighter text-center">Un mensaje para los creadores</h3>
              <p className="text-center italic text-lg text-natural-secondary">
                "La madera tiene una memoria que nosotros, como artesanos, debemos respetar. Optimizar cada corte no es solo una cuestión económica; es una forma de respeto hacia este recurso natural tan noble."
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setView('app')}
                  className="px-12 py-4 bg-natural-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all"
                >
                  Crea tu próximo diseño hoy
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-natural-muted font-sans selection:bg-natural-accent/30 selection:text-natural-primary">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-natural-divider px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-natural-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Box className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic text-natural-primary tracking-tighter leading-none">CORTEX</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary -mt-0.5">Optimice & Design</p>
            </div>
          </div>
          <nav className="flex items-center gap-10">
            <button onClick={() => setView('about')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary transition-colors">Quiénes Somos</button>
            <button 
              onClick={() => setView('app')}
              className="px-8 py-3 bg-natural-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-natural-primary/20"
            >
              Comenzar Ahora
            </button>
          </nav>
        </header>

        <main className="pt-48 pb-20 px-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-natural-accent/10 border border-natural-accent/20 rounded-full text-[10px] font-black uppercase tracking-widest text-natural-primary italic">Profesional & Preciso</span>
              </div>
              <h2 className="text-7xl font-black text-natural-primary leading-[1.1] tracking-tighter italic">
                Optimiza tu despiece con <span className="text-natural-accent">Cortex</span>.
              </h2>
              <p className="text-xl text-natural-secondary font-medium leading-relaxed max-w-xl">
                La herramienta definitiva para carpinteros y diseñadores. Calcula el aprovechamiento máximo de tus planchas, visualiza en 3D y genera guías de montaje técnicas en segundos.
              </p>
              <div className="flex gap-6 pt-4">
                <button 
                  onClick={() => setView('app')}
                  className="px-10 py-5 bg-natural-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-natural-primary/30 transition-all flex items-center gap-3 group"
                >
                  Ir al Optimizador <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="w-full aspect-square bg-white rounded-[4rem] shadow-2xl border border-natural-border p-8 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full">
                  <div className="absolute top-10 right-10 w-40 h-40 bg-natural-accent rounded-3xl opacity-10 blur-3xl animate-pulse" />
                  <div className="absolute bottom-10 left-10 w-60 h-60 bg-natural-primary rounded-full opacity-5 blur-3xl" />
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <Box className="w-48 h-48 text-natural-primary opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Extensive Content Sections */}
          <section className="mt-40 space-y-32 max-w-5xl mx-auto">
            <div className="space-y-12">
              <h2 className="text-5xl font-black text-natural-primary italic tracking-tighter text-center">¿Por qué es vital la optimización de despiece?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-natural-secondary font-medium leading-relaxed">
                    En la industria del mueble contemporánea, la eficiencia no es solo un lujo, es una necesidad operativa. Cada centímetro cuadrado de material cuenta. El uso de algoritmos de optimización de corte (Nesting) permite reducir el desperdicio hasta en un 25%, impactando directamente en la rentabilidad de tus proyectos y reduciendo la huella ambiental.
                  </p>
                  <p className="text-lg text-natural-secondary font-medium leading-relaxed">
                    Nuestra plataforma utiliza lógica matemática avanzada para organizar tus piezas (laterales, bases, techos y estantes) dentro de las planchas de formato estándar. Esto evita errores de cálculo manuales que suelen resultar en piezas mal cortadas o material insuficiente a mitad del proceso.
                  </p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-natural-border shadow-lg">
                  <h4 className="text-xs font-black uppercase text-natural-accent mb-4 tracking-widest">Beneficios Clave</h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-natural-primary mt-2" />
                      <span className="text-sm font-bold text-natural-primary">Reducción drástica de costos en materiales.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-natural-primary mt-2" />
                      <span className="text-sm font-bold text-natural-primary">Menor tiempo dedicado a la planificación del corte.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-natural-primary mt-2" />
                      <span className="text-sm font-bold text-natural-primary">Generación de listas de materiales precisas para compras.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <h2 className="text-5xl font-black text-natural-primary italic tracking-tighter text-center">Modelado 3D como herramienta de venta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 bg-natural-primary p-12 rounded-[3rem] text-white space-y-8">
                  <h4 className="text-2xl font-black italic tracking-tight uppercase">Visualización Inmersiva</h4>
                  <p className="opacity-80 leading-relaxed">
                    Un cliente que puede visualizar su mueble antes de que se corte la primera tabla es un cliente más seguro. Nuestra vista previa 3D te permite mostrar la proporción exacta del mueble, la distribución de estantes y, lo más importante, el acabado final.
                  </p>
                  <p className="opacity-80 leading-relaxed">
                    Con las opciones de texturas como Roble, Cerezo y acabados modernos, puedes presentar propuestas realistas que eliminan las dudas sobre el resultado estético del proyecto.
                  </p>
                </div>
                <div className="order-1 md:order-2 space-y-6">
                  <p className="text-lg text-natural-secondary font-medium leading-relaxed">
                    El diseño asistido por computadora ya no es exclusivo de grandes estudios de arquitectura. Cortex lleva el poder del modelado isométrico a tu navegador, permitiéndote iterar sobre dimensiones de altura, profundidad y ancho en tiempo real.
                  </p>
                  <p className="text-lg text-natural-secondary font-medium leading-relaxed">
                    Además, nuestra función de "Detalle de Montaje" en modo wireframe (esquema de alambre) permite desglosar la estructura interna. Esto es fundamental para entender cómo encajan los amarres superiores, el fondo y los zócalos, garantizando una construcción robusta y duradera.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12 bg-white p-20 rounded-[4rem] border border-natural-border shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-natural-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
               <h2 className="text-4xl font-black text-natural-primary italic tracking-tighter mb-10">Consejos para un despiece profesional</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-4">
                   <div className="text-3xl font-black text-natural-accent">01</div>
                   <h5 className="font-black text-natural-primary uppercase text-sm">Considera el espesor del disco</h5>
                   <p className="text-sm text-natural-secondary leading-relaxed">
                     Al planificar cortes, siempre incluimos el margen del disco de sierra. Un descuido en esto puede significar que la última pieza sea varios milímetros más pequeña de lo requerido.
                   </p>
                 </div>
                 <div className="space-y-4">
                   <div className="text-3xl font-black text-natural-accent">02</div>
                   <h5 className="font-black text-natural-primary uppercase text-sm">Dirección de la veta</h5>
                   <p className="text-sm text-natural-secondary leading-relaxed">
                     Para acabados como cerezo o roble, la dirección de la veta es crítica. Asegúrate de que los laterales y puertas tengan la veta en sentido vertical para una estética equilibrada.
                   </p>
                 </div>
                 <div className="space-y-4">
                   <div className="text-3xl font-black text-natural-accent">03</div>
                   <h5 className="font-black text-natural-primary uppercase text-sm">Zócalos y Estabilidad</h5>
                   <p className="text-sm text-natural-secondary leading-relaxed">
                     Nunca omitas un zócalo en muebles pesados. No solo protege la madera de la humedad del suelo, sino que proporciona un punto de apoyo estructural para los laterales de carga.
                   </p>
                 </div>
               </div>
            </div>

            <div className="space-y-12">
               <h2 className="text-5xl font-black text-natural-primary italic tracking-tighter text-center">La evolución de la carpintería digital</h2>
               <div className="space-y-8 max-w-3xl mx-auto">
                 <p className="text-lg text-natural-secondary font-medium leading-relaxed text-center">
                   El futuro de la fabricación de muebles reside en la automatización de procesos repetitivos para que el artesano pueda concentrarse en lo importante: el detalle y el ensamblaje. Cortex está diseñado para ser ese puente.
                 </p>
                 <p className="text-lg text-natural-secondary font-medium leading-relaxed text-center">
                   Desde estanterías flotantes hasta muebles aéreos complejos, la lógica detrás de cada cálculo en nuestra app ha sido refinada para reflejar la realidad del taller. Entendemos que un despiece no es solo una lista de números, es el ADN de tu creación.
                 </p>
               </div>
            </div>
          </section>

          <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-10 bg-white rounded-[3rem] border border-natural-border shadow-md space-y-6">
              <div className="w-16 h-16 bg-natural-muted rounded-2xl flex items-center justify-center">
                <Settings2 className="w-8 h-8 text-natural-primary" />
              </div>
              <h3 className="text-2xl font-black italic text-natural-primary uppercase tracking-tighter">Algoritmo de Nesting</h3>
              <p className="text-natural-secondary font-medium leading-relaxed">
                Nuestra lógica avanzada asegura el mínimo desperdicio de material en cortes longitudinales y transversales de forma automática.
              </p>
            </div>
            <div className="p-10 bg-white rounded-[3rem] border border-natural-border shadow-md space-y-6">
              <div className="w-16 h-16 bg-natural-muted rounded-2xl flex items-center justify-center">
                <Dna className="w-8 h-8 text-natural-primary" />
              </div>
              <h3 className="text-2xl font-black italic text-natural-primary uppercase tracking-tighter">Guía de Montaje</h3>
              <p className="text-natural-secondary font-medium leading-relaxed">
                Visualización técnica por capas (Wireframe) para entender el ensamble de cada pieza sin errores de interpretación.
              </p>
            </div>
            <div className="p-10 bg-white rounded-[3rem] border border-natural-border shadow-md space-y-6">
              <div className="w-16 h-16 bg-natural-muted rounded-2xl flex items-center justify-center">
                <Layout className="w-8 h-8 text-natural-primary" />
              </div>
              <h3 className="text-2xl font-black italic text-natural-primary uppercase tracking-tighter">Diseño 3D Realista</h3>
              <p className="text-natural-secondary font-medium leading-relaxed">
                Muestra a tus clientes cómo quedará su proyecto final con nuestra amplia selección de acabados y texturas de madera.
              </p>
            </div>
          </section>

          {/* Espacio para AdSense en Landing */}
          <div className="mt-40 w-full p-20 bg-natural-border/20 rounded-[4rem] text-center border border-dashed border-natural-border">
             <p className="text-[10px] font-black uppercase tracking-widest text-natural-secondary mb-8">Anuncio Informativo</p>
             <div className="max-w-3xl mx-auto space-y-6">
               <p className="text-lg text-natural-primary font-bold italic">
                 Al utilizar nuestra plataforma, apoyas el desarrollo continuo de herramientas gratuitas para toda la comunidad de carpintería y diseño.
               </p>
               <div className="w-full h-[280px] bg-white border border-natural-border rounded-3xl flex items-center justify-center shadow-sm">
                  <span className="text-[10px] uppercase font-black tracking-widest text-natural-muted">Publicidad Relevante &bull; Espacio Google Adsense</span>
               </div>
             </div>
          </div>
          
          <footer className="mt-40 text-center pb-20 space-y-6">
             <div className="flex items-center justify-center gap-10">
                <button onClick={() => setView('landing')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary">Inicio</button>
                <button onClick={() => setView('about')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary">Quiénes Somos</button>
                <button onClick={() => setView('app')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary">Optimizador</button>
             </div>
             <div className="flex items-center justify-center gap-4">
                <Box className="w-6 h-6 text-natural-primary opacity-30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-natural-secondary">Cortex Optimice 2026 &bull; Potenciando la Imaginación en Madera</span>
             </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-natural-bg text-natural-text font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar: Projects and Info */}
      <aside className="w-80 border-r border-natural-border bg-white flex flex-col shadow-sm">
        <div className="p-6 border-b border-natural-divider flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-natural-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-natural-primary/20">
              <Layout className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display italic leading-none">Mader<span className="text-natural-secondary not-italic">App</span></h1>
              <p className="text-[10px] text-natural-secondary font-bold uppercase tracking-widest mt-1">Design System</p>
            </div>
          </div>
          <Button onClick={handleCreateProject} className="w-full bg-natural-primary hover:bg-natural-primary/90 text-white shadow-md rounded-xl h-11 font-bold uppercase tracking-wider text-[10px]">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-6 flex flex-col gap-8">
            {currentProject ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-3">
                  <Label className="text-[10px] uppercase font-black text-natural-secondary tracking-[0.2em] px-1">Proyecto Activo</Label>
                  <div className="p-4 bg-natural-muted rounded-2xl border border-natural-border flex flex-col gap-2">
                    <p className="text-sm font-bold text-natural-text truncate">{currentProject.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-natural-secondary font-medium">
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {currentProject.items.length} Muebles</span>
                      <span className="w-1 h-1 bg-natural-divider rounded-full" />
                      <span>{new Date(currentProject.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Label className="text-[10px] uppercase font-black text-natural-secondary tracking-[0.2em] px-1">Acciones Rápidas</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setActiveTab('editor')}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'editor' ? 'bg-natural-accent/20 text-natural-primary border border-natural-primary/10' : 'hover:bg-natural-muted text-natural-secondary hover:text-natural-text'}`}
                    >
                      <Layout className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">Editor 3D</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('despiece')}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'despiece' ? 'bg-natural-accent/20 text-natural-primary border border-natural-primary/10' : 'hover:bg-natural-muted text-natural-secondary hover:text-natural-text'}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">Lista de Corte</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('cortex')}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'cortex' ? 'bg-natural-accent/20 text-natural-primary border border-natural-primary/10' : 'hover:bg-natural-muted text-natural-secondary hover:text-natural-text'}`}
                    >
                      <Settings2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">Optimización</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('assembly')}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'assembly' ? 'bg-natural-accent/20 text-natural-primary border border-natural-primary/10' : 'hover:bg-natural-muted text-natural-secondary hover:text-natural-text'}`}
                    >
                      <Dna className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-tight">Detalle Montaje</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-natural-primary text-white rounded-2xl shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Resumen</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold font-display">{allParts.length} Piezas</p>
                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-tighter">Listas para taller</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-16 h-16 bg-natural-muted rounded-2xl flex items-center justify-center text-natural-secondary/30">
                  <Box className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-natural-secondary uppercase tracking-widest">Cree un proyecto para comenzar</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t border-natural-divider mt-auto bg-gradient-to-t from-natural-muted to-white">
          <div className="flex items-center gap-4 p-1">
             <div className="w-11 h-11 rounded-2xl bg-natural-accent flex items-center justify-center text-natural-primary font-bold shadow-sm border border-white">
               PE
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-natural-text leading-tight">Patricio C.</p>
               <p className="text-[10px] text-natural-secondary uppercase font-bold tracking-widest mt-0.5">Plan Profesional</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentProject ? (
          <>
            {/* Header */}
            <header className="h-20 border-b border-natural-border bg-white flex items-center justify-between px-8 shadow-sm z-10">
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <Input 
                    value={currentProject.name} 
                    onChange={(e) => updateCurrentProject({...currentProject, name: e.target.value})}
                    className="border-none shadow-none text-xl font-bold p-0 focus-visible:ring-0 w-auto min-w-[200px] bg-transparent text-natural-text placeholder:text-natural-secondary/50 font-display"
                    placeholder="Nombre del Proyecto..."
                  />
                </div>
                <Separator orientation="vertical" className="h-6 bg-natural-divider" />
                <div className="flex items-center gap-6">
                  <button onClick={() => setView('landing')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary transition-colors">Volver al Inicio</button>
                  <button onClick={() => setView('about')} className="text-[10px] font-black uppercase tracking-widest text-natural-secondary hover:text-natural-primary transition-colors">Quiénes Somos</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleExport} className="border-natural-border hover:bg-natural-muted rounded-lg font-medium text-natural-text">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                {/* Save button removed per user request */}
              </div>
            </header>

            {/* Tabs & Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs 
                value={activeTab} 
                onValueChange={(v) => setActiveTab(v as any)} 
                className="flex-1 flex flex-col"
              >
                <div className="px-8 border-b border-natural-border bg-white/80 backdrop-blur-sm">
                  <TabsList className="bg-transparent h-16 gap-8">
                    <TabsTrigger value="editor" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-natural-primary rounded-none h-16 px-0 font-bold text-xs uppercase tracking-widest text-natural-secondary data-[state=active]:text-natural-primary transition-all gap-2">
                      <Layout className="w-4 h-4" /> Dimensionado
                    </TabsTrigger>
                    <TabsTrigger value="despiece" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-natural-primary rounded-none h-16 px-0 font-bold text-xs uppercase tracking-widest text-natural-secondary data-[state=active]:text-natural-primary transition-all gap-2">
                      <Package className="w-4 h-4" /> Despiece
                    </TabsTrigger>
                    <TabsTrigger value="cortex" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-natural-primary rounded-none h-16 px-0 font-bold text-xs uppercase tracking-widest text-natural-secondary data-[state=active]:text-natural-primary transition-all gap-2">
                      <Settings2 className="w-4 h-4" /> Optimización
                    </TabsTrigger>
                    <TabsTrigger value="assembly" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-natural-primary rounded-none h-16 px-0 font-bold text-xs uppercase tracking-widest text-natural-secondary data-[state=active]:text-natural-primary transition-all gap-2">
                      <Dna className="w-4 h-4" /> Detalle Montaje
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="editor" className="m-0 h-full overflow-hidden">
                    <div className="flex h-full">
                      {/* Left side: Items control */}
                      <ScrollArea className="w-[380px] border-r border-natural-border bg-white shadow-inner">
                        <div className="p-6 flex flex-col gap-8">
                          <div className="flex flex-col gap-4">
                            <Label className="text-[10px] uppercase font-bold text-natural-secondary tracking-[0.2em]">Biblioteca de Plantillas</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => handleAddItem('wall')}
                                className="flex flex-col items-center justify-center p-4 border border-natural-border rounded-xl bg-white hover:bg-natural-accent/10 hover:border-natural-primary/50 transition-all group shadow-sm"
                              >
                                <div className="p-2 mb-2 bg-natural-muted rounded-lg text-natural-primary group-hover:scale-110 transition-transform">
                                  <Maximize2 className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-natural-secondary group-hover:text-natural-primary">Aéreo</span>
                              </button>
                              <button 
                                onClick={() => handleAddItem('shelving')}
                                className="flex flex-col items-center justify-center p-4 border border-natural-border rounded-xl bg-white hover:bg-natural-accent/10 hover:border-natural-primary/50 transition-all group shadow-sm"
                              >
                                <div className="p-2 mb-2 bg-natural-muted rounded-lg text-natural-primary group-hover:scale-110 transition-transform">
                                  <Rows className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-natural-secondary group-hover:text-natural-primary">Estante</span>
                              </button>
                              <button 
                                onClick={() => handleAddItem('modern-shelf')}
                                className="flex flex-col items-center justify-center p-4 border border-natural-border rounded-xl bg-white hover:bg-natural-accent/10 hover:border-natural-primary/50 transition-all group shadow-sm"
                              >
                                <div className="p-2 mb-2 bg-natural-muted rounded-lg text-natural-primary group-hover:scale-110 transition-transform">
                                  <Dna className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-natural-secondary group-hover:text-natural-primary">Moderno Zig-Zag</span>
                              </button>
                              <button 
                                onClick={() => handleAddItem('stepped-shelf')}
                                className="flex flex-col items-center justify-center p-4 border border-natural-border rounded-xl bg-white hover:bg-natural-accent/10 hover:border-natural-primary/50 transition-all group shadow-sm"
                              >
                                <div className="p-2 mb-2 bg-natural-muted rounded-lg text-natural-primary group-hover:scale-110 transition-transform">
                                  <LayoutPanelTop className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-natural-secondary group-hover:text-natural-primary">Escalinata 6 Cubos</span>
                              </button>
                            </div>
                          </div>

                          <Separator className="bg-natural-divider" />

                          <div className="flex flex-col gap-4">
                            <Label className="text-[10px] uppercase font-bold text-natural-secondary tracking-[0.2em]">Muebles en Proyecto</Label>
                            {currentProject.items.length === 0 ? (
                              <div className="text-center py-16 border-2 border-dashed border-natural-border rounded-2xl bg-natural-muted/30">
                                <Package className="w-10 h-10 text-natural-accent mx-auto mb-3 opacity-50" />
                                <p className="text-xs font-bold text-natural-secondary uppercase tracking-wider">Sin muebles agregados</p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-4">
                                {currentProject.items.map(item => (
                                  <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={item.id}
                                  >
                                    <Card className="overflow-hidden border-natural-border bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                                      <CardHeader className="p-4 bg-natural-muted/40 border-b border-natural-divider flex flex-row items-center justify-between space-y-0">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-natural-primary border border-natural-border shadow-xs">
                                            {item.type === 'shelving' ? <Rows className="w-4 h-4" /> : item.type === 'modern-shelf' ? <Dna className="w-4 h-4" /> : item.type === 'stepped-shelf' ? <LayoutPanelTop className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                          </div>
                                          <CardTitle className="text-sm font-bold uppercase tracking-tight">{item.name}</CardTitle>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-natural-secondary hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteItem(item.id)}>
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </CardHeader>
                                      <CardContent className="p-5 grid grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-2">
                                          <Label className="text-[9px] uppercase font-bold text-natural-secondary tracking-widest px-1">Ancho</Label>
                                          <Input 
                                            type="number" 
                                            className="h-9 text-xs px-3 bg-natural-muted/30 border-natural-border focus-visible:ring-natural-primary rounded-lg font-mono"
                                            value={item.dimensions.width} 
                                            onChange={(e) => handleUpdateItemDimensions(item.id, {width: Number(e.target.value)})}
                                          />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <Label className="text-[9px] uppercase font-bold text-natural-secondary tracking-widest px-1">Alto</Label>
                                          <Input 
                                            type="number" 
                                            className="h-9 text-xs px-3 bg-natural-muted/30 border-natural-border focus-visible:ring-natural-primary rounded-lg font-mono"
                                            value={item.dimensions.height} 
                                            onChange={(e) => handleUpdateItemDimensions(item.id, {height: Number(e.target.value)})}
                                          />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <Label className="text-[9px] uppercase font-bold text-natural-secondary tracking-widest px-1">Fondo</Label>
                                          <Input 
                                            type="number" 
                                            className="h-9 text-xs px-3 bg-natural-muted/30 border-natural-border focus-visible:ring-natural-primary rounded-lg font-mono"
                                            value={item.dimensions.depth} 
                                            onChange={(e) => handleUpdateItemDimensions(item.id, {depth: Number(e.target.value)})}
                                          />
                                        </div>

                                        {item.type === 'shelving' && item.shelfPositions && (
                                          <div className="col-span-3 mt-4 flex flex-col gap-4">
                                            <div className="flex items-center justify-between px-1">
                                              <Label className="text-[9px] uppercase font-bold text-natural-secondary tracking-widest">Alturas desde Base (mm)</Label>
                                              <Button variant="ghost" size="sm" onClick={() => handleAddShelf(item.id)} className="h-6 px-2 text-[8px] font-black uppercase text-natural-primary">
                                                <Plus className="w-3 h-3 mr-1" /> Agregar
                                              </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                              {item.shelfPositions.map((pos, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 bg-natural-muted/50 p-1.5 rounded-lg border border-natural-divider group">
                                                  <span className="text-[9px] font-black text-natural-primary w-4">{idx + 1}</span>
                                                  <Input 
                                                    type="number" 
                                                    className="h-7 w-16 text-[10px] px-1 bg-white border-natural-border rounded font-mono"
                                                    value={pos} 
                                                    onChange={(e) => handleUpdateShelfPosition(item.id, idx, Number(e.target.value))}
                                                  />
                                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveShelf(item.id, idx)} className="h-5 w-5 text-natural-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                          {item.type === 'stepped-shelf' && item.steppedShelfParams && (
                                            <div className="col-span-3 mt-4 flex flex-col gap-4">
                                              <div className="flex items-center justify-between px-1">
                                                <Label className="text-[9px] uppercase font-bold text-natural-secondary tracking-widest">Dimensiones Cubos (mm)</Label>
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Ancho Col 1</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.steppedShelfParams?.[0]} 
                                                    onChange={(e) => handleUpdateSteppedParam(item.id, 0, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Ancho Col 2</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.steppedShelfParams?.[1]} 
                                                    onChange={(e) => handleUpdateSteppedParam(item.id, 1, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Ancho Col 3</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.steppedShelfParams?.[2]} 
                                                    onChange={(e) => handleUpdateSteppedParam(item.id, 2, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Alto Fila 1</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.steppedShelfParams?.[3]} 
                                                    onChange={(e) => handleUpdateSteppedParam(item.id, 3, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Alto Fila 2</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.steppedShelfParams?.[4]} 
                                                    onChange={(e) => handleUpdateSteppedParam(item.id, 4, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Alto Fila 3</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.steppedShelfParams?.[5]} 
                                                    onChange={(e) => handleUpdateSteppedParam(item.id, 5, Number(e.target.value))}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {item.type === 'modern-shelf' && item.modernShelfWidths && (
                                            <div className="col-span-3 mt-4 flex flex-col gap-4">
                                              <div className="flex items-center justify-between px-1">
                                                <Label className="text-[9px] uppercase font-bold text-natural-secondary tracking-widest">Dimensiones de Piezas (mm)</Label>
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Lateral Der. (Alto)</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.modernShelfWidths?.[0]} 
                                                    onChange={(e) => handleUpdateModernWidth(item.id, 0, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Techo (Ancho)</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.modernShelfWidths?.[1]} 
                                                    onChange={(e) => handleUpdateModernWidth(item.id, 1, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Repisa 1 (Ancho)</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.modernShelfWidths?.[2]} 
                                                    onChange={(e) => handleUpdateModernWidth(item.id, 2, Number(e.target.value))}
                                                  />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                  <Label className="text-[8px] uppercase font-bold text-natural-secondary opacity-60">Repisa 2 (Ancho)</Label>
                                                  <Input 
                                                    type="number" 
                                                    className="h-8 text-xs px-2 bg-natural-muted/30 border-natural-border rounded-lg font-mono"
                                                    value={item.modernShelfWidths?.[3]} 
                                                    onChange={(e) => handleUpdateModernWidth(item.id, 3, Number(e.target.value))}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollArea>

                      {/* Right side: 3D Preview */}
                      <div className="flex-1 bg-natural-bg p-8 overflow-hidden">
                        <div className="h-full flex flex-col gap-8">
                          <div className="flex-1 relative">
                            {currentProject.items.length > 0 ? (
                              <div className="w-full h-full rounded-[2rem] border border-natural-border bg-white shadow-xl overflow-hidden relative">
                                <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                                  <span className="px-3 py-1 bg-natural-muted border border-natural-border rounded-full text-[10px] font-bold uppercase tracking-widest text-natural-primary w-fit">Vista Previa 3D</span>
                                  <div className="flex gap-2">
                                    <div className="flex gap-1.5 p-1.5 bg-white/80 backdrop-blur border border-natural-divider rounded-xl shadow-sm">
                                      {FINISH_COLORS.map(c => (
                                        <button
                                          key={c.hex}
                                          onClick={() => setSelectedColor(c.hex)}
                                          className={`w-6 h-6 rounded-md border transition-all ${selectedColor === c.hex ? 'border-natural-primary scale-110 shadow-md' : 'border-natural-border hover:scale-105'}`}
                                          style={{ backgroundColor: c.hex }}
                                          title={c.name}
                                        />
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => setWireframeMode(!wireframeMode)}
                                      className={`p-1.5 rounded-xl border transition-all flex items-center justify-center gap-2 px-3 ${wireframeMode ? 'bg-natural-primary text-white border-natural-primary shadow-md' : 'bg-white/80 backdrop-blur border-natural-divider text-natural-primary hover:bg-natural-muted'}`}
                                      title="Toggle Wireframe"
                                    >
                                      <div className={`w-4 h-4 border-2 rounded ${wireframeMode ? 'border-white' : 'border-natural-primary'}`} style={{ borderStyle: 'dashed' }} />
                                      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Estructura</span>
                                    </button>
                                  </div>
                                </div>
                                <ThreeDView 
                                  type={currentProject.items[0].type} 
                                  dimensions={currentProject.items[0].dimensions}
                                  parts={currentProject.items[0].parts}
                                  shelfPositions={currentProject.items[0].shelfPositions}
                                  modernShelfWidths={currentProject.items[0].modernShelfWidths}
                                  steppedShelfParams={currentProject.items[0].steppedShelfParams}
                                  finishColor={selectedColor}
                                  wireframe={wireframeMode}
                                 />
                                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-10 px-8 py-3 bg-white/90 backdrop-blur border border-natural-border rounded-2xl shadow-lg">
                                    <div className="flex flex-col items-center">
                                      <p className="text-xs text-natural-secondary font-bold uppercase tracking-tighter">Color / Acabado</p>
                                      <p className="text-sm font-bold text-natural-primary italic">
                                        {FINISH_COLORS.find(c => c.hex === selectedColor)?.name}
                                      </p>
                                    </div>
                                    <Separator orientation="vertical" className="h-8 bg-natural-divider" />
                                    <div className="flex flex-col items-center">
                                      <p className="text-xs text-natural-secondary font-bold uppercase tracking-tighter">Espesor</p>
                                      <p className="text-sm font-bold text-natural-primary font-mono">{currentProject.items[0].dimensions.thickness}mm</p>
                                    </div>
                                 </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-natural-secondary bg-white rounded-3xl border border-natural-border shadow-sm">
                                <div className="w-24 h-24 bg-natural-muted rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                  <Box className="w-12 h-12 opacity-30" />
                                </div>
                                <h3 className="text-xl font-bold font-display uppercase tracking-wider mb-2">Espacio de Trabajo</h3>
                                <p className="text-sm opacity-60">Elija un modelo para comenzar la edición tridimensional</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-center gap-16 text-center p-8 bg-white rounded-3xl border border-natural-border shadow-md">
                             <div className="flex flex-col gap-1">
                                <p className="text-3xl font-bold text-natural-primary font-display">{allParts.length}</p>
                                <p className="text-[10px] uppercase font-bold text-natural-secondary tracking-[0.2em]">Piezas Totales</p>
                             </div>
                             <Separator orientation="vertical" className="h-12 bg-natural-divider" />
                             <div className="flex flex-col gap-1">
                                <p className="text-3xl font-bold text-natural-primary font-display">{cuttingPlans.length}</p>
                                <p className="text-[10px] uppercase font-bold text-natural-secondary tracking-[0.2em]">Planchas Requeridas</p>
                             </div>
                             <Separator orientation="vertical" className="h-12 bg-natural-divider" />
                             <div className="flex flex-col gap-1">
                                <p className="text-3xl font-bold text-emerald-600 font-display">
                                  {cuttingPlans.length > 0 ? Math.round(cuttingPlans.reduce((acc, p) => acc + p.usage, 0) / cuttingPlans.length) : 0}%
                                </p>
                                <p className="text-[10px] uppercase font-bold text-natural-secondary tracking-[0.2em]">Aprovechamiento</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="despiece" className="m-0 h-full p-8 overflow-hidden">
                    <Card className="h-full flex flex-col border-natural-border shadow-lg rounded-3xl overflow-hidden bg-white">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-natural-divider bg-natural-muted/30 p-8">
                        <div>
                          <CardTitle className="font-display text-2xl">Planilla de Fabricación</CardTitle>
                          <CardDescription className="text-natural-secondary font-medium">Listado técnico detallado para taller y dimensionado</CardDescription>
                        </div>
                        <Button variant="outline" className="border-natural-border shadow-sm bg-white" onClick={handleExport}>
                          <FileText className="w-4 h-4 mr-2" />
                          Generar Guía
                        </Button>
                      </CardHeader>
                      <ScrollArea className="flex-1">
                        <div className="p-8">
                           <div className="rounded-2xl border border-natural-border overflow-hidden bg-white shadow-sm">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-natural-muted text-natural-primary uppercase text-[10px] font-black tracking-[0.1em]">
                                  <tr>
                                    <th className="px-6 py-5">Descripción de Pieza</th>
                                    <th className="px-6 py-5">Ancho (mm)</th>
                                    <th className="px-6 py-5">Largo (mm)</th>
                                    <th className="px-6 py-5">Esp. (mm)</th>
                                    <th className="px-6 py-5 text-center">Cant.</th>
                                    <th className="px-6 py-5">Material</th>
                                    <th className="px-6 py-5">Ref. Mueble</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-natural-divider">
                                  {currentProject.items.map(item => (
                                    item.parts.map(part => (
                                      <tr key={part.id} className="hover:bg-natural-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-natural-accent rounded-full" />
                                            <span className="font-bold text-natural-text uppercase leading-tight">{part.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{part.width}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{part.height}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{part.thickness}</td>
                                        <td className="px-6 py-4 text-center font-bold">{part.quantity}</td>
                                        <td className="px-6 py-4">
                                          <span className="px-3 py-1 rounded-full bg-natural-muted border border-natural-border text-[9px] font-black text-natural-primary uppercase tracking-tighter shadow-xs">
                                            {part.material}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-natural-secondary italic text-xs font-medium">{item.name}</td>
                                      </tr>
                                    ))
                                  ))}
                                </tbody>
                             </table>
                           </div>
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>

                   <TabsContent value="cortex" className="m-0 h-full p-8 overflow-hidden">
                    <div className="flex flex-col gap-8 h-full overflow-hidden">
                      <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-natural-border shadow-md">
                        <div className="flex items-center gap-10">
                           <div className="flex flex-col gap-2">
                              <Label className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em] px-1">Configuración de Sustrato</Label>
                              <Select value={selectedSheetType} onValueChange={(v) => setSelectedSheetType(v as any)}>
                                <SelectTrigger className="w-72 h-12 bg-natural-muted/30 border-natural-border rounded-xl font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-natural-border">
                                  {SHEET_TYPES.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="font-medium">{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           </div>
                           <div className="flex flex-col gap-2 cursor-help">
                              <Label className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em] px-1">Espesor de Corte (Kerf)</Label>
                              <div className="h-12 flex items-center px-6 border border-natural-border bg-natural-muted/30 rounded-xl font-mono text-sm font-bold text-natural-primary">
                                4.0 mm
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                           <Dna className="w-5 h-5 text-emerald-600" />
                           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Optimización Cuatro Puntos</span>
                        </div>
                      </div>

                      <ScrollArea className="flex-1">
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-16">
                           {cuttingPlans.length > 0 ? (
                             cuttingPlans.map((plan, i) => (
                               <motion.div
                                 initial={{ opacity: 0, y: 30 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                                 key={plan.sheet.id}
                               >
                                  <CuttingPlanView plan={plan} />
                               </motion.div>
                             ))
                           ) : (
                             <div className="col-span-full py-40 text-center bg-white border border-natural-border border-dashed rounded-[3rem]">
                               <Layout className="w-20 h-20 text-natural-accent mx-auto mb-6 opacity-30" />
                               <h3 className="text-2xl font-display font-bold text-natural-secondary uppercase tracking-widest">Algoritmo en Reposo</h3>
                               <p className="text-sm text-natural-secondary/60 mt-2">Agregue piezas técnicas para visualizar la estrategia de corte</p>
                             </div>
                           )}
                         </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="assembly" className="m-0 h-full p-8 overflow-hidden">
                    <div className="h-full flex flex-col gap-8">
                       <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-natural-border shadow-md">
                        <div>
                          <h2 className="text-2xl font-black italic text-natural-primary tracking-tighter uppercase">Guía de Montaje Técnico</h2>
                          <p className="text-xs text-natural-secondary font-medium tracking-tight mt-1">Estructura interna y visualización isométrica de ensamble.</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-natural-muted border border-natural-border rounded-2xl shadow-sm">
                           <Layout className="w-5 h-5 text-natural-primary" />
                           <span className="text-[10px] font-black text-natural-primary uppercase tracking-widest">Vista Estructural (Wireframe)</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-white rounded-3xl border border-natural-border shadow-md overflow-hidden relative">
                        {currentProject.items.length > 0 ? (
                          <>
                            <ThreeDView 
                               type={currentProject.items[0].type} 
                               dimensions={currentProject.items[0].dimensions} 
                               parts={currentProject.items[0].parts}
                               shelfPositions={currentProject.items[0].shelfPositions}
                               modernShelfWidths={currentProject.items[0].modernShelfWidths}
                               steppedShelfParams={currentProject.items[0].steppedShelfParams}
                               isAssembly={true}
                             />
                             <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur border border-natural-border px-4 py-2 rounded-xl shadow-sm">
                               <p className="text-[10px] font-black uppercase text-natural-primary mb-1">Modo de Visualización</p>
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-natural-primary animate-pulse" />
                                 <span className="text-[10px] font-bold text-natural-secondary">Esquema Alámbrico de Alta Precisión</span>
                               </div>
                             </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-natural-secondary">
                            <Package className="w-12 h-12 opacity-20 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">Agregue piezas para ver el ensamble</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-natural-bg text-natural-secondary">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center max-w-lg px-12"
            >
              <div className="w-32 h-32 bg-white rounded-[3rem] shadow-xl border border-natural-border flex items-center justify-center mb-10">
                <Box className="w-16 h-16 text-natural-primary opacity-20" />
              </div>
              <h2 className="text-4xl font-display font-bold text-natural-text mb-4 text-center">Taller Digital Mader<span className="text-natural-primary">App</span></h2>
              <p className="text-center text-natural-secondary/80 leading-relaxed mb-10 text-lg">
                Su entorno profesional para dimensionado, optimización de cortes y gestión de proyectos de carpintería técnica.
              </p>
              <Button onClick={handleCreateProject} className="bg-natural-primary hover:bg-natural-primary/90 h-14 px-10 rounded-2xl shadow-xl shadow-natural-primary/20 transition-all hover:scale-105 font-bold text-white uppercase tracking-widest text-xs">
                Comenzar Nuevo Proyecto
              </Button>
            </motion.div>
          </div>
        )}
      </main>
      
      {/* Footer minimal info bar */}
      <footer className="fixed bottom-0 left-80 right-0 h-6 bg-natural-primary text-white/70 text-[9px] px-8 flex items-center justify-between font-bold uppercase tracking-widest z-50">
        <span>Dimensionador MaderApp v2.4.1 [Stable]</span>
        <div className="flex gap-8">
          <span>Escala 1:20</span>
          <span>Unidades: mm</span>
          <span>Sustrato: MDF Crudo/Melamina</span>
        </div>
      </footer>
    </div>
  );
}
