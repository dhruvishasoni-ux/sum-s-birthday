import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSky } from '../../context/SkyContext';

interface Particle { id: number; x: number; y: number; size: number; opacity: number; color: string; }

function makeParticles(count = 320): Particle[] {
  const palette = ['#f9a8d4', '#fbcfe8', '#f472b6', '#ffe4e6', '#fb7185'];
  return Array.from({ length: count }, (_, id) => {
    const t = Math.random() * Math.PI * 2;
    const heartX = 16 * Math.sin(t) ** 3;
    const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const band = Math.random() < 0.68 ? (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 58;
    const swirl = (t * 2.4 + id * 0.11) % (Math.PI * 2);
    const x = heartX * 8.3 + Math.cos(swirl) * band + Math.sin(t * 3) * 5;
    const y = heartY * 7.2 + Math.sin(swirl) * band * 0.62;
    return { id, x, y, size: Math.random() * 2.5 + 0.65, opacity: Math.random() * 0.65 + 0.25, color: palette[Math.floor(Math.random() * palette.length)] };
  });
}

export const NebulaObject: React.FC = () => {
  const { openPersonality, isNebulaOpened, personalityWords } = useSky();
  const ref = useRef<HTMLDivElement>(null);
  const particles = useMemo(() => makeParticles(), []);
  const [pointer, setPointer] = useState({ x: 1000, y: 1000 });

  const handleMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({ x: event.clientX - (rect.left + rect.width / 2), y: event.clientY - (rect.top + rect.height / 2) });
  }, []);

  return (
    <div ref={ref} className={`personality-nebula ${isNebulaOpened ? 'opened' : 'unopened'}`} onMouseMove={handleMove} onMouseLeave={() => setPointer({ x: 1000, y: 1000 })} onClick={(event) => { event.stopPropagation(); openPersonality(); }} title="Personality Nebula">
      <div className="personality-nebula-aura" />
      <div className="personality-nebula-core" />
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
      <div className="personality-nebula-label"><span>Personality</span><small>{personalityWords.length ? `${personalityWords.length} floating ${personalityWords.length === 1 ? 'thought' : 'thoughts'}` : 'describe Sum'}</small></div>
    </div>
  );
};
