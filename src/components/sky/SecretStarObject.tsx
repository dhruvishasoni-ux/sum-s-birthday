import React from 'react';
import { SecretStar } from '../../types/celestial';
import { useSky } from '../../context/SkyContext';

interface SecretStarObjectProps {
  star: SecretStar;
}

export const SecretStarObject: React.FC<SecretStarObjectProps> = ({ star }) => {
  const { discoverSecretStar } = useSky();
  const isDiscovered = star.discovered;

  return (
    <div
      className={`secret-star-node ${isDiscovered ? 'discovered' : 'undiscovered'}`}
      style={{
        position: 'absolute',
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 12,
        width: '16px',
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        e.stopPropagation();
        discoverSecretStar(star.id);
      }}
      title="✦"
    >
      {/* Normal Small Circular Star */}
      <span
        className={`secret-star-dot ${!isDiscovered ? 'glowing-secret-star' : 'normal-secret-star'}`}
        style={{
          width: isDiscovered ? '3px' : '3.8px',
          height: isDiscovered ? '3px' : '3.8px',
          borderRadius: '50%',
          backgroundColor: star.hexColor,
          boxShadow: isDiscovered
            ? `0 0 4px ${star.hexColor}`
            : `0 0 8px ${star.hexColor}, 0 0 16px ${star.hexColor}, 0 0 24px ${star.hexColor}aa`,
          transition: 'all 0.5s ease',
          display: 'block'
        }}
      />
    </div>
  );
};
