import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { X, Sparkles, Send, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BlackHoleModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    addBlackHoleWish,
    setAuthNotice
  } = useSky();

  const [wishText, setWishText] = useState('');
  const [isSucking, setIsSucking] = useState(false);
  const [suckedText, setSuckedText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (activeModal !== 'black-hole') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to submit your prayer to the Black Hole.');
      setActiveModal('auth');
      return;
    }

    const trimmed = wishText.trim();
    if (!trimmed) {
      setErrorMessage('Please write your wish or prayer before submitting.');
      return;
    }

    setSuckedText(trimmed);
    setIsSucking(true);

    // Save in session state
    addBlackHoleWish(trimmed);

    // Gravitational suction sequence
    setTimeout(() => {
      setIsSucking(false);
      setIsCompleted(true);
      setWishText('');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#38bdf8', '#f59e0b', '#ec4899']
      });
    }, 2400);
  };

  const handleReset = () => {
    setIsCompleted(false);
    setIsSucking(false);
    setWishText('');
    setErrorMessage(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content black-hole-modal-window animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="black-hole-header">
          <div>
            <div className="eyebrow">COSMIC SINGULARITY · SACRED VOID</div>
            <h2>Wish or Prayer for the Upcoming Year</h2>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={() => setActiveModal(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="black-hole-content-area">
          {/* Central Animated Singularity Visual */}
          <div className="black-hole-visual-center">
            <div className={`singularity-core ${isSucking ? 'active-vortex' : ''}`}>
              <div className="singularity-glow-outer" />
              <div className="singularity-event-horizon" />
              <div className="singularity-spiral-rays" />
            </div>

            {/* Suction animation overlay for submitted text */}
            {isSucking && (
              <div className="gravitational-suction-text animate-spiral-suck">
                "{suckedText}"
              </div>
            )}
          </div>

          {!currentUser ? (
            /* Logged-Out Prompt */
            <div className="black-hole-auth-required animate-fade-in">
              <p className="void-quote">
                "Give your burdens, prayers, and wishes to the singularity — watch negativity dissolve into stardust."
              </p>
              <div className="auth-prompt-card">
                <AlertCircle size={20} className="icon-amber" />
                <p>You must be logged in to submit a prayer to the Black Hole.</p>
                <button
                  type="button"
                  className="continue-button"
                  onClick={() => {
                    setAuthNotice('Log in to submit your wish or prayer to the Black Hole.');
                    setActiveModal('auth');
                  }}
                >
                  <span>Log In / Sign Up</span>
                </button>
              </div>
            </div>
          ) : isCompleted ? (
            /* Completed Disappearance Confirmation */
            <div className="black-hole-completed-pane animate-fade-in">
              <div className="void-absorbed-icon">✦</div>
              <h3>Absorbed by the Cosmic Singularity</h3>
              <p className="void-blessing-text">
                Your prayer has crossed the event horizon. All negativity and burdens are symbolically dissolved into infinite cosmic light.
              </p>

              <div className="black-hole-actions-row">
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={handleReset}
                >
                  <RefreshCw size={15} />
                  <span>Submit Another Wish</span>
                </button>

                <button
                  type="button"
                  className="continue-button"
                  onClick={() => setActiveModal(null)}
                >
                  <span>Return to Sky</span>
                </button>
              </div>
            </div>
          ) : !isSucking ? (
            /* Input Form */
            <form onSubmit={handleSubmit} className="black-hole-form animate-fade-in">
              <p className="black-hole-prompt-desc">
                Write a sincere wish or prayer for the upcoming year (e.g. <em>"Remove all negativity and let this year be peaceful and joyful."</em>). When you submit, the text is gravitationally pulled into the black hole and disappears.
              </p>

              {errorMessage && (
                <div className="auth-feedback error animate-fade-in">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="prayer-input-container">
                <textarea
                  className="studio-textarea black-hole-input"
                  rows={4}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Type your prayer or wish here... It will be absorbed into the void."
                  maxLength={300}
                  autoFocus
                />
              </div>

              <div className="black-hole-submit-footer">
                <div className="contributor-tag-subtle">
                  <span>Praying as: <strong>{currentUser.username}</strong></span>
                </div>

                <button
                  type="submit"
                  className="continue-button black-hole-pull-btn"
                  disabled={!wishText.trim()}
                >
                  <span>Surrender to Black Hole</span>
                  <Send size={16} />
                </button>
              </div>
            </form>
          ) : (
            <div className="sucking-status-text">
              <span>Pulling into the Singularity...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
