import React from 'react';
import { useSky } from '../../context/SkyContext';

export const BlackHoleObject: React.FC = () => {
  const { openBlackHole, isBlackHoleOpened } = useSky();

  return (
    <div
      className={`sky-black-hole-wrapper ${isBlackHoleOpened ? 'opened' : 'unopened'}`}
      style={{
        position: 'absolute',
        left: '72%',
        top: '65%',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 16,
        width: '180px',
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
      onClick={(e) => {
        e.stopPropagation();
        openBlackHole();
      }}
      title="Black Hole · Wish & Prayer Void"
    >
      {/* Outer Gravitational Lensing Distortion Ring */}
      <div className="black-hole-lensing-ring" />

      {/* Swirling Glowing Accretion Disk (Animated SVG) */}
      <svg
        viewBox="0 0 200 200"
        className="black-hole-disk-svg"
      >
        <defs>
          <radialGradient id="accretionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="42%" stopColor="#ff7b00" stopOpacity="0.8" />
            <stop offset="68%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          <filter id="diskBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Outer Plasma Aura */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="url(#accretionGlow)"
          className="plasma-aura-pulse"
        />

        {/* Accretion Disk Ellipse */}
        <ellipse
          cx="100"
          cy="100"
          rx="82"
          ry="32"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="6"
          filter="url(#diskBlur)"
          opacity="0.85"
          className="accretion-disk-spin"
        />

        <ellipse
          cx="100"
          cy="100"
          rx="72"
          ry="26"
          fill="none"
          stroke="#ec4899"
          strokeWidth="3.5"
          opacity="0.9"
          className="accretion-disk-spin-reverse"
        />

        <ellipse
          cx="100"
          cy="100"
          rx="60"
          ry="20"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          opacity="0.75"
        />

        {/* Central Event Horizon (Pure Absolute Black Void) */}
        <circle
          cx="100"
          cy="100"
          r="30"
          fill="#000000"
          stroke="#f59e0b"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />

        {/* Photon Sphere Ring */}
        <circle
          cx="100"
          cy="100"
          r="32"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeOpacity="0.8"
          className="photon-ring-glow"
        />
      </svg>

    </div>
  );
};
