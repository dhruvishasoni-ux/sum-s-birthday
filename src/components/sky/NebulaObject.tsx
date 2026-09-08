import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSky } from '../../context/SkyContext';

interface Particle { id: number; x: number; y: number; size: number; opacity: number; color: string; }

function heartPoint(t: number, scale = 1) {
  return {
    x: 16 * Math.sin(t) ** 3 * scale,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale
  };
}

function makeParticles(count = 520): Particle[] {
  const palette = ['#f9a8d4', '#fbcfe8', '#f472b6', '#ffe4e6', '#fb7185', '#fda4af'];
  return Array.from({ length: count }, (_, id) => {
    const t = Math.random() * Math.PI * 2;
    const point = heartPoint(t, 1);
    const fill = Math.random() ** 0.58;
    const spread = 0.8 + fill * 1.6;
    const swirl = t * 2.6 + id * 0.15;
    return {
      id,
      x: point.x * 8.1 * spread + Math.cos(swirl) * (Math.random() * 34),
      y: point.y * 7.4 * spread + Math.sin(swirl) * (Math.random() * 23),
      size: Math.random() * 2.8 + 0.55,
      opacity: Math.random() * 0.62 + 0.22,
      color: palette[Math.floor(Math.random() * palette.length)]
    };
  });
}

function makeHeartStroke(id: string, scale: number, rotation: number) {
  const points = Array.from({ length: 70 }, (_, index) => {
    const t = (index / 69) * Math.PI * 2;
    const point = heartPoint(t, scale);
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(' ');
  return { id, points, rotation };
}

export const NebulaObject: React.FC = () => {
  const { openPersonality, isNebulaOpened } = useSky();
  const ref = useRef<HTMLDivElement>(null);
  const particles = useMemo(() => makeParticles(), []);
  const heartStrokes = useMemo(
    () => [
      makeHeartStroke('outer', 8.4, 0),
      makeHeartStroke('middle', 6.7, 12),
      makeHeartStroke('inner', 5.1, -10)
    ],
    []
  );
  const [pointer, setPointer] = useState({ x: 1000, y: 1000 });

  const handleMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({ x: event.clientX - (rect.left + rect.width / 2), y: event.clientY - (rect.top + rect.height / 2) });
  }, []);

  return (
    <div ref={ref} className={`personality-nebula ${isNebulaOpened ? 'opened' : 'unopened'}`} onMouseMove={handleMove} onMouseLeave={() => setPointer({ x: 1000, y: 1000 })} onClick={(event) => { event.stopPropagation(); openPersonality(); }} title="Personality Nebula" aria-label="Open personality nebula" role="button" tabIndex={0}>
      <div className="personality-nebula-aura" />
      <div className="personality-nebula-core" />
      <svg className="personality-nebula-heart" viewBox="-170 -145 340 290" aria-hidden="true">
        {heartStrokes.map((stroke) => (
          <polyline key={stroke.id} points={stroke.points} transform={`rotate(${stroke.rotation})`} />
        ))}
      </svg>
      <div className="personality-nebula-particles">
        {particles.map((particle) => {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          const force = distance < 105 ? (1 - distance / 105) * 24 : 0;
          const x = particle.x + (distance ? (dx / distance) * force : 0);
          const y = particle.y + (distance ? (dy / distance) * force : 0);
          return <span key={particle.id} className="personality-nebula-particle" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, width: particle.size, height: particle.size, opacity: particle.opacity, background: particle.color, boxShadow: `0 0 ${particle.size * 4}px ${particle.color}` }} />;
        })}
      </div>
    </div>
  );
};
