import React from 'react';
import { useSky } from '../../context/SkyContext';

export const BottomBar: React.FC = () => {
  const { wishes, stories, friendsCount, unopenedCount } = useSky();

  return (
    <div className="bottom-right-status-bar">
      <div className="status-bar-item" title="Total Wishes">
        <span className="status-val">{wishes.length}</span>
        <span className="status-lbl">Wishes</span>
      </div>

      <div className="status-bar-divider" />

      <div className="status-bar-item" title="Total Constellations">
        <span className="status-val">{stories.length}</span>
        <span className="status-lbl">Constellations</span>
      </div>

      <div className="status-bar-divider" />

      <div className="status-bar-item" title="Friends Contributing">
        <span className="status-val">{friendsCount}</span>
        <span className="status-lbl">Friends</span>
      </div>

      <div className="status-bar-divider" />

      <div className="status-bar-item unopened-item" title="Unopened Items">
        <span className="status-unopened-dot" />
        <span className="status-unopened-text">{unopenedCount} Unopened</span>
      </div>
    </div>
  );
};
