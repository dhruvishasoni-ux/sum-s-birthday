import React, { useState, useRef } from 'react';
import { useSky } from '../../context/SkyContext';
import { WishCard, StickerItem, ConstellationPoint, ConstellationConnection } from '../../types/celestial';
import { TextStyleConfig } from '../../types/editor';
import { RichTextToolbar } from '../shared/RichTextToolbar';
import { StickerBar } from '../shared/StickerBar';
import { StickerCanvasOverlay } from '../shared/StickerCanvasOverlay';
import { FramePicker, AVAILABLE_FRAMES } from '../shared/FramePicker';
import { X, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WishStudioModal: React.FC = () => {
  const { activeModal, setActiveModal, addWish, accentColor, currentUser } = useSky();

  const [activeTab, setActiveTab] = useState<'card' | 'constellation' | 'stickers' | 'frame'>('card');

  // Card Content
  const [title, setTitle] = useState('Happy Birthday! ✨');
  const [titleStyle, setTitleStyle] = useState<TextStyleConfig>({
    font: 'elegant',
    color: '#FFE58A',
    size: 22,
    bold: true,
    italic: false,
    underline: false
  });

  const [body, setBody] = useState('Wishing you infinite joy, love, and starlight on your special day! 🌟');
  const [bodyStyle, setBodyStyle] = useState<TextStyleConfig>({
    font: 'modern',
    color: '#ffffff',
    size: 14,
    bold: false,
    italic: false,
    underline: false
  });

  const [from, setFrom] = useState(currentUser ? `— ${currentUser.username}` : '— Your bestie ♡');
  const [fromStyle, setFromStyle] = useState<TextStyleConfig>({
    font: 'cursive',
    color: '#FF9FCB',
    size: 16,
    bold: false,
    italic: true,
    underline: false
  });

  const [selectedFrame, setSelectedFrame] = useState('none');
  const [cardAccentColor, setCardAccentColor] = useState(accentColor);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Constellation Star Points Canvas
  const [constellationPoints, setConstellationPoints] = useState<ConstellationPoint[]>([
    { id: 1, x: 40, y: 70 },
    { id: 2, x: 90, y: 40 },
    { id: 3, x: 150, y: 60 },
    { id: 4, x: 190, y: 110 },
    { id: 5, x: 110, y: 140 }
  ]);
  const [connections, setConnections] = useState<ConstellationConnection[]>([
    { fromId: 1, toId: 2 },
    { fromId: 2, toId: 3 },
    { fromId: 3, toId: 4 },
    { fromId: 4, toId: 5 },
    { fromId: 5, toId: 1 }
  ]);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

  const constellationCanvasRef = useRef<HTMLDivElement>(null);

  if (activeModal !== 'wish-studio') return null;

  // Handle adding stars on constellation canvas
  const handleConstellationCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!constellationCanvasRef.current) return;
    const rect = constellationCanvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const newId = Date.now();
    const newPoint: ConstellationPoint = { id: newId, x, y };

    setConstellationPoints((prev) => [...prev, newPoint]);

    // Automatically connect to previously selected point if any
    if (selectedPointId !== null) {
      setConnections((prev) => [...prev, { fromId: selectedPointId, toId: newId }]);
      setSelectedPointId(newId);
    } else if (constellationPoints.length > 0) {
      const lastPt = constellationPoints[constellationPoints.length - 1];
      setConnections((prev) => [...prev, { fromId: lastPt.id, toId: newId }]);
      setSelectedPointId(newId);
    } else {
      setSelectedPointId(newId);
    }
  };

  const handlePointClick = (e: React.MouseEvent, ptId: number) => {
    e.stopPropagation();
    if (selectedPointId === null) {
      setSelectedPointId(ptId);
    } else if (selectedPointId === ptId) {
      setSelectedPointId(null);
    } else {
      // Connect points
      setConnections((prev) => [...prev, { fromId: selectedPointId, toId: ptId }]);
      setSelectedPointId(ptId);
    }
  };

  const handleResetConstellation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConstellationPoints([]);
    setConnections([]);
    setSelectedPointId(null);
  };

  const handleAddSticker = (symbol: string, isCustom = false, customUrl?: string) => {
    const newSticker: StickerItem = {
      id: `stk-${Date.now()}`,
      symbol,
      isCustom,
      customUrl,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      scale: 1.1,
      rotation: 0
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleCreateWishAndConstellation = () => {
    const posX = 15 + Math.random() * 70;
    const posY = 15 + Math.random() * 70;

    const newWish: WishCard = {
      id: `wish-${Date.now()}`,
      creatorId: currentUser?.id,
      creatorName: currentUser?.username,
      creatorAvatar: currentUser?.avatarUrl,
      title,
      titleStyle,
      body,
      bodyStyle,
      from,
      fromStyle,
      frame: selectedFrame,
      accentColor: cardAccentColor,
      stickers,
      x: posX,
      y: posY,
      points: constellationPoints,
      connections,
      unopened: true,
      createdAt: Date.now()
    };

    addWish(newWish);
    setActiveModal(null);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const frameObj = AVAILABLE_FRAMES.find((f) => f.id === selectedFrame);
  const selectedStickerObj = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="modal-backdrop">
      <div className="modal-content compact-studio-window animate-scale-in">
        {/* Header */}
        <div className="compact-studio-header">
          <div className="header-titles">
            <span className="eyebrow">CREATE WISH CARD & CONSTELLATION</span>
            <h2>Wish Studio ✦</h2>
          </div>

          <div className="studio-tab-switches">
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'card' ? 'active' : ''}`}
              onClick={() => setActiveTab('card')}
            >
              1. Card Text
            </button>
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'constellation' ? 'active' : ''}`}
              onClick={() => setActiveTab('constellation')}
            >
              2. Draw Constellation
            </button>
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'frame' ? 'active' : ''}`}
              onClick={() => setActiveTab('frame')}
            >
              3. Frame & Glow
            </button>
            <button
              type="button"
              className={`studio-tab-pill ${activeTab === 'stickers' ? 'active' : ''}`}
              onClick={() => setActiveTab('stickers')}
            >
              4. Stickers
            </button>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Studio Body: Left Controls, Right Preview */}
        <div className="compact-studio-grid">
          {/* LEFT: Active Tab Controls */}
          <div className="compact-left-controls">
            {/* TAB 1: Card Text */}
            {activeTab === 'card' && (
              <div className="compact-tab-pane animate-fade-in">
                <div className="compact-input-group">
                  <label className="input-label">Short Greeting</label>
                  <input
                    type="text"
                    className="studio-text-input compact"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                  />
                  <RichTextToolbar styleConfig={titleStyle} onChange={setTitleStyle} showSize={false} />
                </div>

                <div className="compact-input-group" style={{ marginTop: '10px' }}>
                  <label className="input-label">Birthday Message</label>
                  <textarea
                    className="studio-textarea compact"
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={500}
                  />
                  <RichTextToolbar styleConfig={bodyStyle} onChange={setBodyStyle} showSize={false} />
                </div>

                <div className="compact-input-group" style={{ marginTop: '10px' }}>
                  <label className="input-label">From / Signature</label>
                  <input
                    type="text"
                    className="studio-text-input compact"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    maxLength={50}
                  />
                  <RichTextToolbar styleConfig={fromStyle} onChange={setFromStyle} showSize={false} />
                </div>
              </div>
            )}

            {/* TAB 2: Constellation Creator Canvas */}
            {activeTab === 'constellation' && (
              <div className="compact-tab-pane animate-fade-in">
                <div className="canvas-instruction-row">
                  <span className="section-title">Constellation Canvas</span>
                  <button
                    type="button"
                    className="clear-canvas-btn"
                    onClick={handleResetConstellation}
                  >
                    <RefreshCw size={12} />
                    <span>Clear</span>
                  </button>
                </div>
                <p className="tab-hint-text">
                  Click on the canvas to place stars. Click two stars to draw connecting lines.
                </p>

                <div
                  ref={constellationCanvasRef}
                  className="interactive-constellation-canvas"
                  onClick={handleConstellationCanvasClick}
                >
                  <svg className="canvas-lines-svg">
                    {connections.map((conn, idx) => {
                      const p1 = constellationPoints.find((p) => p.id === conn.fromId);
                      const p2 = constellationPoints.find((p) => p.id === conn.toId);
                      if (!p1 || !p2) return null;
                      return (
                        <line
                          key={`c-${idx}`}
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={cardAccentColor}
                          strokeWidth="2"
                          strokeOpacity="0.8"
                        />
                      );
                    })}
                  </svg>

                  {constellationPoints.map((pt) => {
                    const isSelected = selectedPointId === pt.id;
                    return (
                      <div
                        key={pt.id}
                        className={`canvas-star-node ${isSelected ? 'selected' : ''}`}
                        style={{
                          left: `${pt.x}px`,
                          top: `${pt.y}px`,
                          borderColor: cardAccentColor
                        }}
                        onClick={(e) => handlePointClick(e, pt.id)}
                      >
                        <span className="star-core" style={{ backgroundColor: cardAccentColor }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Frames & Accent Glow */}
            {activeTab === 'frame' && (
              <div className="compact-tab-pane animate-fade-in">
                <FramePicker selectedFrame={selectedFrame} onChange={setSelectedFrame} />

                <div className="sub-label" style={{ marginTop: '14px' }}>
                  Card & Constellation Accent Glow
                </div>
                <div className="accent-color-row">
                  {['#B89CFF', '#FF9FCB', '#73D4E7', '#FFB27D', '#A7E89B', '#FFE58A'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot-large ${cardAccentColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setCardAccentColor(c)}
                    />
                  ))}
                  <label className="custom-color-input-btn" title="Custom color">
                    <input
                      type="color"
                      value={cardAccentColor}
                      onChange={(e) => setCardAccentColor(e.target.value)}
                      className="hidden-color-input"
                    />
                    <span>+</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: Stickers */}
            {activeTab === 'stickers' && (
              <div className="compact-tab-pane animate-fade-in">
                <StickerBar
                  onAddSticker={handleAddSticker}
                  selectedSticker={selectedStickerObj}
                  onUpdateSelectedSticker={(upd) =>
                    setStickers((prev) =>
                      prev.map((s) => (s.id === selectedStickerId ? { ...s, ...upd } : s))
                    )
                  }
                  onDeleteSelectedSticker={() => {
                    setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId));
                    setSelectedStickerId(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT: Live Normal-Sized Physical Card Preview */}
          <div className="compact-right-preview">
            <div className="preview-card-wrapper">
              <div
                className={`compact-wish-card ${frameObj?.image ? 'has-image-frame' : ''}`}
                style={{
                  borderColor: cardAccentColor,
                  boxShadow: `0 0 25px ${cardAccentColor}33`
                }}
              >
                {frameObj?.image && (
                  <img
                    src={frameObj.image}
                    alt="Card Frame"
                    className="card-frame-overlay-img"
                  />
                )}

                <div className="card-top-icon" style={{ color: cardAccentColor }}>
                  ✦
                </div>

                <div
                  className={`card-render-title font-${titleStyle.font}`}
                  style={{
                    color: titleStyle.color,
                    fontSize: `${titleStyle.size}px`,
                    fontWeight: titleStyle.bold ? 'bold' : 'normal',
                    fontStyle: titleStyle.italic ? 'italic' : 'normal',
                    textDecoration: titleStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {title || 'Happy Birthday! ✨'}
                </div>

                <div
                  className={`card-render-body font-${bodyStyle.font}`}
                  style={{
                    color: bodyStyle.color,
                    fontSize: `${bodyStyle.size}px`,
                    fontWeight: bodyStyle.bold ? 'bold' : 'normal',
                    fontStyle: bodyStyle.italic ? 'italic' : 'normal',
                    textDecoration: bodyStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {body || 'Your message...'}
                </div>

                <div
                  className={`card-render-from font-${fromStyle.font}`}
                  style={{
                    color: fromStyle.color,
                    fontSize: `${fromStyle.size}px`,
                    fontWeight: fromStyle.bold ? 'bold' : 'normal',
                    fontStyle: fromStyle.italic ? 'italic' : 'normal',
                    textDecoration: fromStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {from || '— From'}
                </div>

                <div className="card-bottom-accent" style={{ backgroundColor: cardAccentColor }} />

                <StickerCanvasOverlay
                  stickers={stickers}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onUpdateSticker={(id, upd) =>
                    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...upd } : s)))
                  }
                  isEditable={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="compact-studio-footer">
          <span className="footer-info">
            Places your constellation in the sky for this session ✦
          </span>
          <button
            type="button"
            className="continue-button"
            onClick={handleCreateWishAndConstellation}
          >
            <span>Create Constellation</span>
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
