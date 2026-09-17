import React, { useEffect, useMemo, useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { AlertCircle, ArrowLeft, History, Send, User, X } from 'lucide-react';

type Panel = 'main' | 'add' | 'prayers';

export const BlackHoleModal: React.FC = () => {
  const { activeModal, setActiveModal, currentUser, addBlackHoleWish, blackHoleWishes, setAuthNotice } = useSky();
  const [panel, setPanel] = useState<Panel>('main');
  const [wishText, setWishText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [incomingId, setIncomingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'black-hole') {
      setPanel('main');
      setWishText('');
      setErrorMessage(null);
      setIncomingId(null);
    }
  }, [activeModal]);

  const animatedPrayers = useMemo(() => blackHoleWishes.slice(-8), [blackHoleWishes]);

  if (activeModal !== 'black-hole') return null;

  const openAddPrayer = () => {
    if (!currentUser) {
      setAuthNotice('Please Log In or Sign Up to add a prayer.');
      setActiveModal('auth');
      return;
    }
    setErrorMessage(null);
    setPanel('add');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    const text = wishText.trim();
    if (!text) {
      setErrorMessage('Write a prayer before submitting.');
      return;
    }
    const id = `prayer-${Date.now()}`;
    setIncomingId(id);
    addBlackHoleWish(text);
    setWishText('');
    setPanel('main');
    window.setTimeout(() => setIncomingId(null), 5200);
  };

  const close = () => {
    setPanel('main');
    setActiveModal(null);
  };

  return (
    <div className="modal-backdrop black-hole-backdrop" onClick={close}>
      <div className="black-hole-modal-window glass-panel animate-scale-in" onClick={(event) => event.stopPropagation()}>
        <header className="black-hole-header">
          <div className="black-hole-title-block">
            <span className="eyebrow">A COSMIC PLACE TO LET GO</span>
            <h2>{panel === 'main' ? 'Send a Prayer into the Universe' : panel === 'add' ? 'Add a Prayer' : 'See the Prayers'}</h2>
            <p>{panel === 'main' ? 'Words of hope are gently pulled into the Black Hole for her upcoming year.' : panel === 'add' ? 'Write a prayer for her upcoming year.' : 'Every prayer released into the Black Hole, held with care.'}</p>
          </div>
          <button type="button" className="close-modal-btn" onClick={close} aria-label="Close Black Hole"><X size={20} /></button>
        </header>

        {panel === 'main' && (
          <main className="black-hole-main-panel">
            <div className="black-hole-stage" aria-label="Prayers traveling into the Black Hole">
              <div className="singularity-core">
                <div className="singularity-glow-outer" />
                <div className="singularity-event-horizon" />
                <div className="singularity-spiral-rays" />
              </div>
              {animatedPrayers.map((prayer, index) => (
                <div
                  key={prayer.id}
                  className={`black-hole-prayer-traveler ${incomingId === prayer.id ? 'is-new' : ''}`}
                  style={{ '--prayer-index': index, '--prayer-x': `${((index * 29) % 70) - 35}px`, '--prayer-y': `${((index * 43) % 150) - 75}px` } as React.CSSProperties}
                >
                  <span>{prayer.wishText}</span>
                </div>
              ))}
              {blackHoleWishes.length === 0 && <div className="black-hole-empty-hint">Prayers will travel here</div>}
            </div>
            <div className="black-hole-main-copy"><p>Write something hopeful. As it travels inward, the Black Hole absorbs the weight and leaves only warmth for her year ahead.</p></div>
            <div className="black-hole-primary-actions">
              <button type="button" className="continue-button" onClick={openAddPrayer}><Send size={16} /> Add a Prayer</button>
              <button type="button" className="secondary-action-btn" onClick={() => setPanel('prayers')}><History size={16} /> See the Prayers <span className="action-count">{blackHoleWishes.length}</span></button>
            </div>
          </main>
        )}

        {panel === 'add' && (
          <form className="black-hole-prayer-form" onSubmit={handleSubmit}>
            <button type="button" className="black-hole-back-button" onClick={() => setPanel('main')}><ArrowLeft size={16} /> Back to Black Hole</button>
            {errorMessage && <div className="auth-feedback error"><AlertCircle size={16} /> {errorMessage}</div>}
            <label htmlFor="black-hole-prayer">Write a prayer for her upcoming year</label>
            <textarea id="black-hole-prayer" value={wishText} onChange={(event) => { setWishText(event.target.value); setErrorMessage(null); }} placeholder="I hope this year brings you peace and happiness..." maxLength={350} autoFocus />
            <div className="black-hole-form-footer"><span className="contributor-tag-subtle">Submitting as <strong>{currentUser?.username}</strong></span><button type="submit" className="continue-button" disabled={!wishText.trim()}>Submit Prayer <Send size={16} /></button></div>
          </form>
        )}

        {panel === 'prayers' && (
          <section className="black-hole-prayers-panel">
            <button type="button" className="black-hole-back-button" onClick={() => setPanel('main')}><ArrowLeft size={16} /> Back to Black Hole</button>
            {blackHoleWishes.length === 0 ? <div className="black-hole-empty-list"><History size={28} /><p>No prayers have been submitted yet.</p></div> : <div className="black-hole-prayer-list">{blackHoleWishes.map((prayer) => <article className="black-hole-prayer-entry" key={prayer.id}><p>{prayer.wishText}</p><div className="black-hole-prayer-sender">{prayer.creatorAvatar ? <img src={prayer.creatorAvatar} alt="" /> : <span><User size={14} /></span>}<strong>{prayer.creatorName}</strong></div></article>)}</div>}
          </section>
        )}
      </div>
    </div>
  );
};
