import React, { useEffect, useRef, useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { PlanetDesign } from '../../types/celestial';
import { X, Undo2, Eraser, ArrowRight, RotateCcw } from 'lucide-react';

const COLORS = ['#f97316', '#ef4444', '#facc15', '#38bdf8', '#4ade80', '#a855f7', '#ec4899', '#ffffff'];
const ACCENTS = ['#B89CFF', '#FF9FCB', '#73D4E7', '#FFB27D', '#A7E89B', '#FFE58A'];
type Brush = 'glow' | 'solid' | 'fine' | 'sparkle';

interface PlanetDesignerModalProps { onCompleteDesign?: (design: PlanetDesign) => void; }

export const PlanetDesignerModal: React.FC<PlanetDesignerModalProps> = ({ onCompleteDesign }) => {
  const { activeModal, setActiveModal, accentColor } = useSky();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [brush, setBrush] = useState<Brush>('glow');
  const [color, setColor] = useState('#f97316');
  const [size, setSize] = useState(24);
  const [eraserSize, setEraserSize] = useState(28);
  const [eraser, setEraser] = useState(false);
  const [accent, setAccent] = useState(accentColor);
  const [hasRings, setHasRings] = useState(true);

  const planetPath = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
  };
  const paintBase = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); planetPath(ctx, canvas); ctx.fillStyle = '#fff'; ctx.fill(); history.current = [];
  };
  useEffect(() => { if (activeModal === 'planet-designer') setTimeout(paintBase, 40); }, [activeModal]);

  const snapshot = () => { const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (canvas && ctx) history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); };
  const coords = (e: React.PointerEvent<HTMLCanvasElement>) => { const c = canvasRef.current!; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; };
  const draw = (x: number, y: number, moving: boolean) => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const radius = eraser ? eraserSize / 2 : size / 2;
    ctx.save(); planetPath(ctx, c); ctx.clip();
    if (eraser) { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = eraserSize; ctx.lineCap = 'round'; if (moving && lastPoint.current) { ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(x, y); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); } }
    else if (brush === 'solid' || brush === 'fine') { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = brush === 'fine' ? Math.max(3, size / 3) : size; ctx.lineCap = 'round'; if (moving && lastPoint.current) { ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(x, y); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); } }
    else if (brush === 'glow') { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = size * .9; ctx.beginPath(); ctx.arc(x, y, radius * .55, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = color; for (let i = 0; i < 8; i++) { const a = Math.random() * Math.PI * 2; const d = Math.random() * size * 1.5; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(1.5, size / 12), 0, Math.PI * 2); ctx.fill(); } ctx.beginPath(); ctx.arc(x, y, Math.max(2, size / 8), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); lastPoint.current = { x, y };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => { snapshot(); drawingRef.current = true; lastPoint.current = coords(e); draw(lastPoint.current.x, lastPoint.current.y, false); e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => { if (drawingRef.current) { const p = coords(e); draw(p.x, p.y, true); } };
  const up = () => { drawingRef.current = false; lastPoint.current = null; };
  const undo = () => { const c = canvasRef.current; const ctx = c?.getContext('2d'); const state = history.current.pop(); if (c && ctx && state) ctx.putImageData(state, 0, 0); };
  const proceed = () => { const canvas = canvasRef.current; const design: PlanetDesign = { canvasDataUrl: canvas?.toDataURL() || '', hasRings, accentColor: accent }; onCompleteDesign?.(design); setActiveModal('story-studio'); };
  if (activeModal !== 'planet-designer') return null;

  const brushes: { id: Brush; label: string; mark: string }[] = [{ id: 'glow', label: 'Soft glow', mark: '◉' }, { id: 'solid', label: 'Solid', mark: '●' }, { id: 'fine', label: 'Fine detail', mark: '·' }, { id: 'sparkle', label: 'Sparkle star', mark: '✦' }];
  return <div className="modal-backdrop"><div className="modal-content planet-designer-window glass-panel animate-scale-in">
    <header className="studio-header"><div><div className="eyebrow">RELIVE A DAY · STEP 1</div><h2>Planet Designer</h2><p>Paint a small world for your story.</p></div><button type="button" className="close-modal-btn" onClick={() => setActiveModal(null)} aria-label="Close"><X size={22} /></button></header>
    <div className="planet-editor-layout"><aside className="planet-tool-panel">
      <section className="planet-tool-section"><h3>Brush</h3><div className="planet-brush-grid">{brushes.map((b) => <button type="button" key={b.id} className={`planet-brush-btn ${!eraser && brush === b.id ? 'active' : ''}`} onClick={() => { setBrush(b.id); setEraser(false); }}><span>{b.mark}</span>{b.label}</button>)}</div></section>
      <section className="planet-tool-section"><h3>Brush Color</h3><div className="planet-color-row">{COLORS.map(c => <button type="button" key={c} aria-label={`Color ${c}`} className={`planet-color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => { setColor(c); setEraser(false); }} />)}<label className="planet-color-picker"><input type="color" value={color} onChange={e => { setColor(e.target.value); setEraser(false); }} />+</label></div></section>
      <section className="planet-tool-section"><div className="planet-section-heading"><h3>Brush Size</h3><output>{size}px</output></div><input aria-label="Brush size" type="range" min="6" max="56" value={size} onChange={e => setSize(Number(e.target.value))} /></section>
      <section className="planet-tool-section"><button type="button" className="planet-undo-btn" disabled={!history.current.length} onClick={undo}><Undo2 size={16} /> Undo</button></section>
      <section className="planet-tool-section"><h3>Eraser</h3><div className="planet-eraser-row">{[14, 28, 46].map(v => <button type="button" key={v} className={`planet-size-chip ${eraser && eraserSize === v ? 'active' : ''}`} onClick={() => { setEraser(true); setEraserSize(v); }}>{v}px</button>)}</div></section>
      <section className="planet-tool-section"><h3>Accent Color</h3><div className="planet-color-row">{ACCENTS.map(c => <button type="button" key={c} aria-label={`Accent ${c}`} className={`planet-color-swatch ${accent === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setAccent(c)} />)}<label className="planet-color-picker"><input type="color" value={accent} onChange={e => setAccent(e.target.value)} />+</label></div></section>
      <label className="planet-rings-toggle"><input type="checkbox" checked={hasRings} onChange={e => setHasRings(e.target.checked)} /> Planetary rings</label>
    </aside><section className="planet-canvas-panel"><div className="planet-canvas-stage" style={{ '--planet-accent': accent } as React.CSSProperties}>{hasRings && <div className="planet-ring-preview" style={{ borderColor: accent, boxShadow: `0 0 18px ${accent}` }} />}<canvas ref={canvasRef} width={420} height={420} className="circular-planet-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} /></div><p>Draw inside the planet surface. {eraser ? 'Eraser active.' : 'Choose a brush and color.'}</p></section></div>
    <footer className="studio-footer"><span className="footer-info">Step 1 of 2 · Your planet stays intact in Story Studio</span><button type="button" className="continue-button" onClick={proceed}>Next: Write Story <ArrowRight size={18} /></button></footer>
  </div></div>;
};
export default PlanetDesignerModal;
