import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Plus, List, Sparkles, User, AlertCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PersonalityModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    personalityWords,
    addPersonalityWord,
    currentUser,
    setAuthNotice
  } = useSky();

  const [viewMode, setViewMode] = useState<'floating' | 'list'>('floating');
  const [isAdding, setIsAdding] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (activeModal !== 'personality') return null;

  const handleOpenAdd = () => {
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to describe Sum in the Heart Nebula.');
      setActiveModal('auth');
      return;
    }
    setIsAdding(true);
    setValidationError(null);
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = wordInput.trim();
    if (!trimmed) {
      setValidationError('Please enter a word describing Sum.');
      return;
    }

    if (/\s/.test(trimmed)) {
      setValidationError('Please enter exactly ONE word (no spaces).');
      return;
    }

    const res = addPersonalityWord(trimmed);
    if (!res.success) {
      setValidationError(res.error || 'Failed to add word.');
      return;
    }

    setWordInput('');
    setIsAdding(false);
    setViewMode('floating');

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content personality-universe-window animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="personality-universe-header">
          <div className="header-titles">
            <span className="eyebrow">HEART NEBULA · SOUL OF SUM</span>
            <h2>Words Describing Sum 💖</h2>
          </div>

          <div className="personality-header-controls">
            {!isAdding && (
              <>
                <button
                  type="button"
                  className={`sub-nav-btn ${viewMode === 'floating' ? 'active' : ''}`}
                  onClick={() => setViewMode('floating')}
                >
                  <Sparkles size={15} />
                  <span>Floating Field</span>
                </button>

                <button
                  type="button"
                  className={`sub-nav-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={15} />
                  <span>List View ({personalityWords.length})</span>
                </button>

                <button
                  type="button"
                  className="add-word-accent-btn"
                  onClick={handleOpenAdd}
                >
                  <Plus size={16} />
                  <span>Add Word</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="close-modal-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="personality-universe-body">
          {isAdding ? (
            /* Add Word Form */
            <div className="add-word-dialog-pane animate-fade-in">
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setIsAdding(false);
                  setValidationError(null);
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Nebula</span>
              </button>

              <div className="add-word-card">
                <h3>Write one word describing Sum</h3>
                <p className="add-word-subtitle">
                  Choose a single meaningful word that represents her warmth, energy, or spirit.
                </p>

                {validationError && (
                  <div className="auth-feedback error animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleWordSubmit} className="single-word-form">
                  <div className="word-input-container">
                    <input
                      type="text"
                      className="studio-text-input word-input"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      placeholder="e.g. Radiant, Brilliant, Sunshine..."
                      maxLength={25}
                      autoFocus
                    />
                  </div>

                  <div className="word-creator-info">
                    <span>Contributing as:</span>
                    <div className="creator-pill">
                      {currentUser?.avatarUrl.startsWith('emoji:') ? (
                        <span>{currentUser.avatarUrl.replace('emoji:', '')}</span>
                      ) : (
                        <img src={currentUser?.avatarUrl} alt="Avatar" className="mini-avatar" />
                      )}
                      <strong>{currentUser?.username}</strong>
                    </div>
                  </div>

                  <div className="add-word-actions">
                    <button
                      type="button"
                      className="secondary-action-btn"
                      onClick={() => {
                        setIsAdding(false);
                        setValidationError(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="continue-button">
                      <span>Release into Nebula</span>
                      <Sparkles size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : viewMode === 'floating' ? (
            /* Floating Words View */
            <div className="floating-words-universe">
              {personalityWords.length === 0 ? (
                <div className="empty-nebula-state animate-fade-in">
                  <div className="empty-floating-heart">💖</div>
                  <h3>No words added yet</h3>
                  <p>Be the first to release a tribute word into the Heart Nebula!</p>
                  <button
                    type="button"
                    className="continue-button"
                    onClick={handleOpenAdd}
                    style={{ marginTop: '16px' }}
                  >
                    <Plus size={16} />
                    <span>Write one word describing Sum</span>
                  </button>
                </div>
              ) : (
                <div className="floating-words-cloud-container">
                  {personalityWords.map((item, index) => (
                    <div
                      key={item.id}
                      className="floating-personality-word-chip animate-float"
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        animationDelay: `${item.floatDelay}s`,
                        animationDuration: `${item.floatDuration}s`,
                        color: item.color,
                        borderColor: `${item.color}55`,
                        boxShadow: `0 0 25px ${item.color}44`
                      }}
                      title={`Added by ${item.creatorName}`}
                    >
                      <span className="word-text">{item.word}</span>
                      <div className="word-contributor-tag">
                        {item.creatorAvatar?.startsWith('emoji:') ? (
                          <span className="mini-tag-emoji">{item.creatorAvatar.replace('emoji:', '')}</span>
                        ) : item.creatorAvatar ? (
                          <img src={item.creatorAvatar} alt="Avatar" className="mini-tag-avatar" />
                        ) : (
                          <User size={10} />
                        )}
                        <span>{item.creatorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chronological List View */
            <div className="personality-list-view-container animate-fade-in">
              {personalityWords.length === 0 ? (
                <div className="empty-nebula-state">
                  <p>No words submitted in this session yet.</p>
                </div>
              ) : (
                <div className="personality-words-list">
                  <div className="list-heading-meta">
                    <span>Submitted Words ({personalityWords.length})</span>
                    <small>Preserved in chronological submission order</small>
                  </div>

                  <div className="words-table-scroll">
                    {personalityWords.map((item, idx) => (
                      <div key={item.id} className="word-list-row animate-fade-in">
                        <div className="row-index">#{idx + 1}</div>
                        <div className="row-word" style={{ color: item.color }}>
                          "{item.word}"
                        </div>
                        <div className="row-creator">
                          {item.creatorAvatar?.startsWith('emoji:') ? (
                            <span className="creator-list-emoji">{item.creatorAvatar.replace('emoji:', '')}</span>
                          ) : item.creatorAvatar ? (
                            <img src={item.creatorAvatar} alt={item.creatorName} className="creator-list-avatar" />
                          ) : (
                            <User size={16} />
                          )}
                          <span className="creator-list-name">{item.creatorName}</span>
                        </div>
                        <div className="row-time">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isAdding && (
          <div className="personality-universe-footer">
            <button
              type="button"
              className="footer-list-toggle-btn"
              onClick={() => setViewMode(viewMode === 'floating' ? 'list' : 'floating')}
            >
              {viewMode === 'floating' ? (
                <>
                  <List size={16} />
                  <span>Open Words List ({personalityWords.length})</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Return to Floating Nebula</span>
                </>
              )}
            </button>

            <span className="session-memory-note">
              ✦ Session runtime memory only
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
