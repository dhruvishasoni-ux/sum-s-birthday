import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Plus, List, Sparkles, User, AlertCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
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

  const [viewMode, setViewMode] = useState<'list' | 'floating'>('list');
  const [isAdding, setIsAdding] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [explanationInput, setExplanationInput] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (activeModal !== 'personality') return null;

  const handleOpenAdd = () => {
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to add a personality word.');
      setActiveModal('auth');
      return;
    }
    setIsAdding(true);
    setValidationError(null);
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedWord = wordInput.trim();
    if (!trimmedWord) {
      setValidationError('1. Word is required. Please enter one or two words describing her.');
      return;
    }

    if (trimmedWord.split(/\s+/).filter(Boolean).length > 2) {
      setValidationError('Please enter ONE or TWO words only.');
      return;
    }

    const trimmedExpl = explanationInput.trim();
    if (!trimmedExpl) {
      setValidationError('2. Explanation is COMPULSORY. Why did you choose this word?');
      return;
    }

    const res = addPersonalityWord(trimmedWord, trimmedExpl);
    if (!res.success) {
      setValidationError(res.error || 'Failed to add word.');
      return;
    }

    setWordInput('');
    setExplanationInput('');
    setIsAdding(false);
    setViewMode('list');

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedEntryId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content personality-universe-window glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="personality-universe-header">
          <div className="header-titles">
            <span className="eyebrow">PERSONALITY NEBULA · HEART & SOUL</span>
            <h2>Nebula Words</h2>
          </div>

          <div className="personality-header-controls">
            {!isAdding && (
              <>
                <button
                  type="button"
                  className={`sub-nav-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={15} />
                  <span>Entries ({personalityWords.length})</span>
                </button>

                <button
                  type="button"
                  className={`sub-nav-btn ${viewMode === 'floating' ? 'active' : ''}`}
                  onClick={() => setViewMode('floating')}
                >
                  <Sparkles size={15} />
                  <span>Sky Field</span>
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
            /* Add Word Form (Compulsory Word + Compulsory Explanation) */
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
                <span>Back to Nebula Words</span>
              </button>

              <div className="add-word-card">
                <h3>One or Two Words Describing Her</h3>
                <p className="add-word-subtitle">
                  Choose a meaningful word (e.g. <em>Kind, Fearless, Creative, Sunshine, Brilliant</em>) and tell her why you chose it.
                </p>

                {validationError && (
                  <div className="auth-feedback error animate-fade-in">
                    <AlertCircle size={16} />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleWordSubmit} className="single-word-form">
                  <div className="nebula-form-group">
                    <label className="input-label required-label">
                      1. Word <span className="compulsory-tag">*1 or 2 words only</span>
                    </label>
                    <input
                      type="text"
                      className="studio-text-input word-input"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      placeholder="e.g. Brilliant, Sunshine, Fearless..."
                      maxLength={30}
                      autoFocus
                    />
                  </div>

                  <div className="nebula-form-group" style={{ marginTop: '14px' }}>
                    <label className="input-label required-label">
                      2. Why did you choose this word? <span className="compulsory-tag">*Compulsory</span>
                    </label>
                    <textarea
                      className="studio-textarea compact"
                      rows={3}
                      value={explanationInput}
                      onChange={(e) => setExplanationInput(e.target.value)}
                      placeholder="Share a heartfelt reason or memory behind this word..."
                      maxLength={350}
                    />
                  </div>

                  <div className="word-creator-info" style={{ marginTop: '12px' }}>
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

                  <div className="add-word-actions" style={{ marginTop: '16px' }}>
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
          ) : viewMode === 'list' ? (
            /* Glass Entries List: Main Word Prominent, Side Creator + Click to Reveal Reason */
            <div className="personality-list-view-container animate-fade-in">
              {personalityWords.length === 0 ? (
                <div className="empty-nebula-state animate-fade-in">
                  <div className="empty-floating-heart">💖</div>
                  <h3>No words added yet</h3>
                  <p>Be the first to describe her in the cosmic heart nebula.</p>
                  <button
                    type="button"
                    className="continue-button"
                    onClick={handleOpenAdd}
                    style={{ marginTop: '16px' }}
                  >
                    <Plus size={16} />
                    <span>Add First Word</span>
                  </button>
                </div>
              ) : (
                <div className="personality-words-list">
                  <div className="list-heading-meta">
                    <span>Words for the Birthday Girl ({personalityWords.length})</span>
                    <small>Preserved in chronological creation order · Click creator to reveal reason</small>
                  </div>

                  <div className="words-cards-scroll">
                    {personalityWords.map((item, idx) => {
                      const isExpanded = expandedEntryId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`nebula-word-card ${isExpanded ? 'expanded' : ''} animate-fade-in`}
                        >
                          <div className="nebula-word-main-row">
                            <div className="word-index-badge">#{idx + 1}</div>

                            {/* MAIN: Prominent Word */}
                            <div className="word-prominent-display" style={{ color: item.color }}>
                              {item.word}
                            </div>

                            {/* SIDE: Small Circular Profile Photo + Username (Clickable) */}
                            <button
                              type="button"
                              className="creator-reveal-button"
                              onClick={() => toggleExpand(item.id)}
                              title="Click to view explanation"
                            >
                              <div className="creator-badge-avatar-wrap">
                                {item.creatorAvatar?.startsWith('emoji:') ? (
                                  <span className="creator-badge-emoji-small">
                                    {item.creatorAvatar.replace('emoji:', '')}
                                  </span>
                                ) : item.creatorAvatar ? (
                                  <img
                                    src={item.creatorAvatar}
                                    alt={item.creatorName}
                                    className="creator-badge-avatar-img"
                                  />
                                ) : (
                                  <User size={13} />
                                )}
                              </div>
                              <span className="creator-reveal-name">{item.creatorName}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>

                          {/* Expandable Section in the same glass interface */}
                          {isExpanded && (
                            <div className="nebula-explanation-drawer animate-fade-in">
                              <div className="drawer-header">Why {item.creatorName} chose "{item.word}":</div>
                              <p className="drawer-explanation-text">
                                {item.explanation || 'No reason provided.'}
                              </p>
                              <div className="drawer-timestamp">
                                Added {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sky Field View */
            <div className="floating-words-universe">
              {personalityWords.length === 0 ? (
                <div className="empty-nebula-state animate-fade-in">
                  <div className="empty-floating-heart">💖</div>
                  <h3>No words in the nebula yet</h3>
                  <button
                    type="button"
                    className="continue-button"
                    onClick={handleOpenAdd}
                    style={{ marginTop: '16px' }}
                  >
                    <Plus size={16} />
                    <span>Add Word</span>
                  </button>
                </div>
              ) : (
                <div className="floating-words-cloud-container">
                  {personalityWords.map((item) => (
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
                      onClick={() => {
                        setViewMode('list');
                        setExpandedEntryId(item.id);
                      }}
                      title={`By ${item.creatorName} — Click to view explanation`}
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
          )}
        </div>

        {/* Footer */}
        {!isAdding && (
          <div className="personality-universe-footer">
            <button
              type="button"
              className="footer-list-toggle-btn"
              onClick={() => setViewMode(viewMode === 'list' ? 'floating' : 'list')}
            >
              {viewMode === 'list' ? (
                <>
                  <Sparkles size={16} />
                  <span>Switch to Sky Field</span>
                </>
              ) : (
                <>
                  <List size={16} />
                  <span>Switch to Entries List ({personalityWords.length})</span>
                </>
              )}
            </button>

            <span className="session-memory-note">
              ✦ Saved in creation order
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
