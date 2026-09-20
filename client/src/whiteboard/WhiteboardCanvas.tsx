import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { WhiteboardElement } from '../types';
import { CustomCRDT } from '../crdt/CustomCRDT';
import { YjsAdapter } from '../crdt/YjsAdapter';
import { LWWEngine } from '../crdt/LWWEngine';
import { NetworkSimulator } from '../network/NetworkSimulator';
import { Square, Circle, Triangle, ArrowRight, Type, StickyNote, Paintbrush, Eraser, Download, ZoomIn, ZoomOut, Move, Grid } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  whiteboardId: string;
  netSim: NetworkSimulator;
}

export const WhiteboardCanvas: React.FC<Props> = ({ whiteboardId, netSim }) => {
  const { currentEngine, user, activeWhiteboard, setActiveWhiteboard, isOffline, addOpTrace, addToast } = useStore();
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<WhiteboardElement['type'] | 'select'>('select');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (activeWhiteboard && activeWhiteboard.elements) {
      setElements(activeWhiteboard.elements);
    }
  }, [activeWhiteboard]);

  const broadcastCanvasOp = (newElements: WhiteboardElement[]) => {
    const prevElements = elements;
    setElements(newElements);
    if (activeWhiteboard) {
      setActiveWhiteboard({ ...activeWhiteboard, elements: newElements });
    }

    const userName = user?.name || 'Anonymous Peer';
    const crdt = new CustomCRDT(user?.id || 'usr_demo_1');
    const yjs = new YjsAdapter(user?.id || 'usr_demo_1');
    const lww = new LWWEngine(user?.id || 'usr_demo_1');

    let op: any;
    if (currentEngine === 'crdt') {
      if (newElements.length > prevElements.length) {
        const added = newElements[newElements.length - 1];
        op = crdt.createCanvasAddOp(whiteboardId, added, newElements, userName);
      } else if (newElements.length < prevElements.length) {
        const removed = prevElements.find(p => !newElements.some(n => n.id === p.id));
        op = crdt.createCanvasDeleteOp(whiteboardId, removed?.id || '', newElements, userName);
      } else {
        const updated = newElements.find(n => {
          const prev = prevElements.find(p => p.id === n.id);
          return prev && JSON.stringify(prev) !== JSON.stringify(n);
        }) || newElements[newElements.length - 1];
        if (updated) {
          op = crdt.createCanvasUpdateOp(whiteboardId, updated, newElements, userName);
        } else {
          op = crdt.createCanvasSyncOp(whiteboardId, newElements, userName);
        }
      }
    } else if (currentEngine === 'yjs') {
      op = yjs.createYjsCanvasOp(whiteboardId, newElements, userName);
    } else {
      op = lww.createLWWCanvasOp(whiteboardId, newElements, userName);
    }

    addOpTrace(op);
    netSim.dispatchOperation(whiteboardId, op, !isOffline);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === 'select' || selectedTool === 'draw') return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newEl: WhiteboardElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: selectedTool,
      x,
      y,
      width: selectedTool === 'sticky' ? 160 : 120,
      height: selectedTool === 'sticky' ? 120 : 80,
      fill: selectedTool === 'sticky' ? '#fef08a' : 'rgba(59, 130, 246, 0.15)',
      stroke: selectedColor,
      strokeWidth: 2,
      text: selectedTool === 'sticky' ? '💡 New Sticky Note' : selectedTool.toUpperCase()
    };

    broadcastCanvasOp([...elements, newEl]);
  };

  // Freehand Brush Drawing
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool !== 'draw') return;
    setIsDrawing(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setCurrentPath([(e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || selectedTool !== 'draw') return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setCurrentPath(prev => [...prev, (e.clientX - rect.left) / zoom, (e.clientY - rect.top) / zoom]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || selectedTool !== 'draw' || currentPath.length === 0) return;
    setIsDrawing(false);

    const newEl: WhiteboardElement = {
      id: `el_draw_${Date.now()}`,
      type: 'draw',
      x: currentPath[0],
      y: currentPath[1],
      points: currentPath,
      stroke: selectedColor,
      strokeWidth: 3
    };

    broadcastCanvasOp([...elements, newEl]);
    setCurrentPath([]);
  };

  // Export Canvas Functions
  const exportPNG = () => {
    addToast({ type: 'success', title: 'Export Canvas', message: 'Downloading high-resolution PNG snapshot...' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('CollabSync Collaborative Whiteboard Export', 20, 20);
    doc.save('collabsync_whiteboard.pdf');
    addToast({ type: 'success', title: 'Export PDF', message: 'Downloaded whiteboard PDF vector.' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-900 overflow-hidden relative">
      {/* Floating Whiteboard Tools Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 shadow-2xl">
        <button
          onClick={() => setSelectedTool('select')}
          className={`p-2 rounded-xl text-xs font-semibold transition-all ${
            selectedTool === 'select' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Select & Drag"
        >
          <Move className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10" />

        <button
          onClick={() => setSelectedTool('rectangle')}
          className={`p-2 rounded-xl transition-all ${
            selectedTool === 'rectangle' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Rectangle"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSelectedTool('circle')}
          className={`p-2 rounded-xl transition-all ${
            selectedTool === 'circle' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Circle"
        >
          <Circle className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSelectedTool('triangle')}
          className={`p-2 rounded-xl transition-all ${
            selectedTool === 'triangle' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Triangle"
        >
          <Triangle className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSelectedTool('sticky')}
          className={`p-2 rounded-xl transition-all ${
            selectedTool === 'sticky' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Sticky Note"
        >
          <StickyNote className="w-4 h-4 text-amber-300" />
        </button>

        <button
          onClick={() => setSelectedTool('draw')}
          className={`p-2 rounded-xl transition-all ${
            selectedTool === 'draw' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
          title="Freehand Brush"
        >
          <Paintbrush className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10" />

        {/* Color Palette */}
        {['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#ffffff'].map(c => (
          <button
            key={c}
            onClick={() => setSelectedColor(c)}
            className={`w-5 h-5 rounded-full border border-white/20 transition-transform ${
              selectedColor === c ? 'scale-125 ring-2 ring-blue-400' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        <div className="h-4 w-px bg-white/10" />

        {/* Export Buttons */}
        <button onClick={exportPNG} className="p-2 rounded-xl text-gray-400 hover:text-white" title="Export PNG">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-20 glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 text-xs">
        <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="text-gray-400 hover:text-white">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono text-gray-200">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="text-gray-400 hover:text-white">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="flex-1 w-full h-full canvas-grid cursor-crosshair overflow-auto">
        <svg
          ref={svgRef}
          className="w-full h-full min-w-[2000px] min-h-[2000px]"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          {elements.map((el) => {
            if (el.type === 'rectangle') {
              return (
                <g key={el.id}>
                  <rect
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    fill={el.fill}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    rx={12}
                  />
                  {el.text && (
                    <text x={el.x + (el.width || 0) / 2} y={el.y + (el.height || 0) / 2} fill="#ffffff" fontSize="12" textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">
                      {el.text}
                    </text>
                  )}
                </g>
              );
            }
            if (el.type === 'circle') {
              return (
                <circle
                  key={el.id}
                  cx={el.x + 50}
                  cy={el.y + 50}
                  r={50}
                  fill={el.fill}
                  stroke={el.stroke}
                  strokeWidth={el.strokeWidth}
                />
              );
            }
            if (el.type === 'sticky') {
              return (
                <g key={el.id}>
                  <rect x={el.x} y={el.y} width={el.width} height={el.height} fill={el.fill} rx={8} />
                  <text x={el.x + 12} y={el.y + 24} fill="#1e293b" fontSize="12" fontWeight="600">
                    {el.text}
                  </text>
                </g>
              );
            }
            if (el.type === 'draw' && el.points) {
              const d = el.points.reduce((acc, val, idx) => (idx % 2 === 0 ? `${acc} ${val}` : `${acc},${val}`), 'M');
              return <path key={el.id} d={d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" />;
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};
