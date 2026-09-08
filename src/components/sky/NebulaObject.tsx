import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useSky } from '../../context/SkyContext';

interface NebulaParticle {
  id: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  color: string;
  twinkle: boolean;
  delay: number;
}

function generateNebulaParticles(count = 55): NebulaParticle[] {
  const particles: NebulaParticle[] = [];
  const colors = ['#f472b6', '#e879f9', '#c084fc', '#ffffff', '#fed7aa', '#fbcfe8'];

  for (let i = 0; i < count; i++) {
    // Generate around heart shape / cosmic cluster
    const t = Math.random() * Math.PI * 2;
    // Parametric heart formula variation for natural distribution
    const heartX = 16 * Math.pow(Math.sin(t), 3);
    const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    // Spread with random scatter
    const spread = Math.random() * 30 + 5;
    const x = (heartX * 7.5) + (Math.random() - 0.5) * spread;
    const y = (heartY * 7.5) + (Math.random() - 0.5) * spread;

    particles.push({
      id: i,
      baseX: x,
      baseY: y,
      size: Math.random() * 2.8 + 1.2,
      opacity: Math.random() * 0.6 + 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() < 0.35,
      delay: Math.random() * 4
    });
  }
  return particles;
}

export const NebulaObject: React.FC = () => {
  const { openPersonality, isNebulaOpened } = useSky();
  const containerRef = useRef<HTMLDivElement>(null);

  const baseParticles = useMemo(() => generateNebulaParticles(55), []);
  const [offsets, setOffsets] = useState<{ [id: number]: { x: number; y: number } }>({});

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - (rect.left + rect.width / 2);
    const cursorY = e.clientY - (rect.top + rect.height / 2);

    const newOffsets: { [id: number]: { x: number; y: number } } = {};
    const repelRadius = 130;
    const maxRepelForce = 35;

    baseParticles.forEach((p) => {
      const dx = p.baseX - cursorX;
      const dy = p.baseY - cursorY;
      const dist = Math.hypot(dx, dy);

      if (dist < repelRadius && dist > 1) {
        const factor = (1 - dist / repelRadius) * maxRepelForce;
        const pushX = (dx / dist) * factor;
        const pushY = (dy / dist) * factor;
        newOffsets[p.id] = { x: pushX, y: pushY };
      }
    });

    setOffsets(newOffsets);
  }, [baseParticles]);

  const handleMouseLeave = useCallback(() => {
    setOffsets({});
  }, []);

  return (
    <div
      ref={containerRef}
      className={`nebula-heart-interactive-cluster ${isNebulaOpened ? 'opened' : 'unopened'}`}
      style={{
        position: 'absolute',
        left: '28%',
        top: '32%',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 14,
        width: '420px',
        height: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
      onClick={(e) => {
        e.stopPropagation();
        openPersonality();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title="Heart Nebula · Personality Words"
    >
      {/* Dynamic Cosmic Back-glow */}
      <div className="nebula-ambient-magenta-glow" />

      {/* Uploaded Reference Heart Nebula Image with background removed / screen blend and radial alpha mask */}
      <div className="nebula-image-mask-wrapper">
        <img
          src="/images/nebula-raw.jpg"
          alt="Heart Nebula"
          className="nebula-isolated-graphic"
          draggable={false}
        />
      </div>

      {/* Surrounding Dynamic Star Field with Interactive Repel Deformation */}
      <div className="nebula-interactive-stars-field">
        {baseParticles.map((p) => {
          const off = offsets[p.id] || { x: 0, y: 0 };
          const curX = p.baseX + off.x;
          const curY = p.baseY + off.y;

          return (
            <div
              key={p.id}
              className={`nebula-interactive-star ${p.twinkle ? 'twinkle-pulse' : ''}`}
              style={{
                position: 'absolute',
                left: `calc(50% + ${curX}px)`,
                top: `calc(50% + ${curY}px)`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                backgroundColor: p.color,
                opacity: isNebulaOpened ? p.opacity * 0.7 : p.opacity,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.35s cubic-bezier(0.1, 0.8, 0.2, 1), top 0.35s cubic-bezier(0.1, 0.8, 0.2, 1)',
                animationDelay: `${p.delay}s`,
                pointerEvents: 'none'
              }}
            />
          );
        })}
      </div>

      {/* Label Badge */}
      <div className="nebula-title-badge">
        <span>🌌 Heart Nebula</span>
      </div>
    </div>
  );
};
