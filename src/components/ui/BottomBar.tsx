import React from 'react';
import { useSky } from '../../context/SkyContext';

export const BottomBar: React.FC = () => {
  const {
    friendsCount,
    unopenedCount,
    isMoonOpened,
    openMoon,
    secretStars,
    discoverSecretStar,
    focusOnCoordinates,
  } = useSky();
  const unopenedStars = secretStars.filter((star) => !star.discovered);

  return (
    <div className="bottom-right-status-bar" aria-label="Sky collection status">
      <div className="status-bar-item" title="Friends Contributing">
        <span className="status-val">{friendsCount}</span>
        <span className="status-lbl">Friends</span>
      </div>

      <div className="status-bar-divider" />

      <div className="status-bar-item unopened-item" title="Unopened Items">
        <span className="status-unopened-dot" />
        <span className="status-unopened-text">{unopenedCount} Unopened</span>
        <span className="unopened-caveat">click to open</span>
        <div className="unopened-collection" aria-label="Unopened collection">
          {!isMoonOpened && (
            <button
              className="unopened-thumb unopened-moon-thumb"
              type="button"
              onClick={() => {
                focusOnCoordinates(52, 18);
                openMoon();
              }}
              aria-label="Open Moon message"
            >
              <span aria-hidden="true" />
            </button>
          )}
          {unopenedStars.map((star) => (
            <button
              className="unopened-thumb unopened-star-thumb"
              key={star.id}
              type="button"
              style={{ '--thumb-color': star.hexColor } as React.CSSProperties}
              onClick={() => {
                focusOnCoordinates(star.x, star.y);
                discoverSecretStar(star.id);
              }}
              aria-label={`Open hidden ${star.hexColor} star`}
            >
              <span aria-hidden="true">★</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
