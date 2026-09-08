import React from 'react';
import { useSky } from '../../context/SkyContext';
import { User, LogIn } from 'lucide-react';

export const HeaderStats: React.FC = () => {
  const { currentUser, setActiveModal, authNotice, setAuthNotice } = useSky();

  return (
    <header className="header-bar-container">
      {/* Auth Notice Toast if logged-out user tries to create content */}
      {authNotice && (
        <div className="auth-notice-toast animate-fade-in" onClick={() => setAuthNotice(null)}>
          <span>🔒 {authNotice}</span>
          <button
            type="button"
            className="auth-toast-btn"
            onClick={(e) => {
              e.stopPropagation();
              setAuthNotice(null);
              setActiveModal('auth');
            }}
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* Top-Right: Authentication / Profile Button */}
      <div className="header-profile-action">
        <button
          type="button"
          className={`create-profile-btn ${currentUser ? 'logged-in' : 'logged-out'}`}
          onClick={() => setActiveModal('auth')}
          title={currentUser ? `Logged in as ${currentUser.username}` : 'Log In or Sign Up'}
        >
          {currentUser?.avatarUrl && !currentUser.avatarUrl.startsWith('emoji:') ? (
            <img src={currentUser.avatarUrl} alt="Avatar" className="header-avatar-thumb" />
          ) : currentUser?.avatarUrl?.startsWith('emoji:') ? (
            <span className="header-avatar-emoji">{currentUser.avatarUrl.replace('emoji:', '')}</span>
          ) : (
            <User size={16} />
          )}

          <span className="header-btn-label">
            {currentUser ? currentUser.username : 'Login / Sign Up'}
          </span>
          {!currentUser && <LogIn size={14} className="header-login-icon" />}
        </button>
      </div>
    </header>
  );
};
