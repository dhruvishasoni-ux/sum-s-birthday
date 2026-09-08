import React, { useState, useRef } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Camera, Lock, User, LogIn, UserPlus, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

const PRESET_AVATARS = [
  '👩‍🚀', '👨‍🚀', '⭐', '✨', '🪐', '🌙', '🌌', '🎈', '💖', '👑', '🚀', '🌟'
];

export const ProfileModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    signUp,
    login,
    logout,
    authNotice,
    setAuthNotice
  } = useSky();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Sign Up form state (ALL 3 REQUIRED)
  const [signupAvatar, setSignupAvatar] = useState<string>('');
  const [signupUsername, setSignupUsername] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('👩‍🚀');

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Status and error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'profile' && activeModal !== 'auth') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSignupAvatar(dataUrl);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectEmojiAvatar = (emoji: string) => {
    setSelectedEmoji(emoji);
    setSignupAvatar(`emoji:${emoji}`);
    setErrorMessage(null);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation: ALL THREE FIELDS ARE STRICTLY COMPULSORY
    const avatarToUse = signupAvatar || (selectedEmoji ? `emoji:${selectedEmoji}` : '');
    if (!avatarToUse) {
      setErrorMessage('1. Profile picture is required. Please upload an image or choose an avatar icon.');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMessage('2. Username is required. Please enter a username.');
      return;
    }
    if (!signupPassword.trim()) {
      setErrorMessage('3. Password is required. Please enter a password.');
      return;
    }

    const res = signUp(signupUsername, signupPassword, avatarToUse);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create account.');
    } else {
      setSuccessMessage(`Welcome, ${signupUsername.trim()}! You are now logged in.`);
      setTimeout(() => {
        setActiveModal(null);
        setSuccessMessage(null);
      }, 1000);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginUsername.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = login(loginUsername, loginPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials.');
    } else {
      setSuccessMessage(`Welcome back, ${loginUsername.trim()}!`);
      setTimeout(() => {
        setActiveModal(null);
        setSuccessMessage(null);
      }, 800);
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMessage('Logged out successfully.');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 1200);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        setAuthNotice(null);
        setActiveModal(null);
      }}
    >
      <div
        className="modal-content auth-modal-window animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="auth-header">
          <div>
            <div className="eyebrow">COSMIC IDENTITY · SESSION ONLY</div>
            <h2>{currentUser ? 'Your Profile' : 'Cosmic Authentication'}</h2>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={() => {
              setAuthNotice(null);
              setActiveModal(null);
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice from failed action attempt */}
        {authNotice && (
          <div className="auth-notice-banner animate-fade-in">
            <Lock size={16} />
            <span>{authNotice}</span>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="auth-feedback error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-feedback success animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {currentUser ? (
          /* Currently Logged In View */
          <div className="auth-logged-in-view animate-fade-in">
            <div className="auth-user-card">
              <div className="auth-avatar-display-lg">
                {currentUser.avatarUrl.startsWith('emoji:') ? (
                  <span className="auth-emoji-display">{currentUser.avatarUrl.replace('emoji:', '')}</span>
                ) : (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="auth-avatar-img-lg" />
                )}
              </div>
              <div className="auth-user-info">
                <h3>{currentUser.username}</h3>
                <span className="auth-session-badge">Active Session Member ✦</span>
              </div>
            </div>

            <p className="auth-session-explainer">
              You are logged in for this website session. You can now create Wish Constellations, Stories, Voice Notes, and submit Black Hole prayers.
            </p>

            <div className="auth-actions-row">
              <button
                type="button"
                className="secondary-action-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                className="continue-button"
                onClick={() => setActiveModal(null)}
              >
                <span>Continue Exploring</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Choices: Login vs Sign Up */
          <div className="auth-forms-container">
            <div className="auth-choice-tabs">
              <button
                type="button"
                className={`auth-choice-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
              >
                <UserPlus size={16} />
                <span>Sign Up</span>
              </button>
              <button
                type="button"
                className={`auth-choice-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            </div>

            {authMode === 'signup' ? (
              /* SIGN UP FORM (ALL 3 FIELDS COMPULSORY) */
              <form onSubmit={handleSignUpSubmit} className="auth-form animate-fade-in">
                {/* 1. Compulsory Profile Picture */}
                <div className="auth-field-section">
                  <label className="input-label required-label">
                    1. Profile Picture <span className="compulsory-tag">*Compulsory</span>
                  </label>

                  <div className="avatar-selection-cluster">
                    <div className="avatar-preview-box">
                      {signupAvatar && !signupAvatar.startsWith('emoji:') ? (
                        <img src={signupAvatar} alt="Avatar" className="custom-avatar-thumb" />
                      ) : (
                        <span className="emoji-avatar-thumb">{selectedEmoji}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="upload-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={15} />
                      <span>{signupAvatar && !signupAvatar.startsWith('emoji:') ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Preset Avatar Emojis */}
                  <div className="preset-avatars-row">
                    <span className="preset-hint">Or choose an avatar icon:</span>
                    <div className="preset-buttons-wrap">
                      {PRESET_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={`preset-avatar-btn ${signupAvatar === `emoji:${emoji}` || (!signupAvatar && selectedEmoji === emoji) ? 'active' : ''}`}
                          onClick={() => handleSelectEmojiAvatar(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Compulsory Username */}
                <div className="auth-field-section">
                  <label className="input-label required-label">
                    2. Username <span className="compulsory-tag">*Compulsory</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="studio-text-input auth-input"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Choose a username..."
                      maxLength={30}
                    />
                  </div>
                </div>

                {/* 3. Compulsory Password */}
                <div className="auth-field-section">
                  <label className="input-label required-label">
                    3. Password <span className="compulsory-tag">*Compulsory</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      className="studio-text-input auth-input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Enter a password..."
                    />
                  </div>
                </div>

                <div className="auth-submit-row">
                  <span className="auth-runtime-note">Stored for this website session only</span>
                  <button type="submit" className="continue-button">
                    <span>Complete Sign Up</span>
                    <UserPlus size={16} />
                  </button>
                </div>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
                <div className="auth-field-section">
                  <label className="input-label">Username</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="studio-text-input auth-input"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Your session username..."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="auth-field-section">
                  <label className="input-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      className="studio-text-input auth-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your password..."
                    />
                  </div>
                </div>

                <div className="auth-submit-row">
                  <button
                    type="button"
                    className="auth-switch-prompt-btn"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                  >
                    Don't have an account? Sign Up
                  </button>
                  <button type="submit" className="continue-button">
                    <span>Login</span>
                    <LogIn size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
