import React, { useState } from 'react';
import { useSky } from '../../context/SkyContext';
import { StickerCanvasOverlay } from '../shared/StickerCanvasOverlay';
import { X, ChevronLeft, ChevronRight, BookOpen, User } from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const { activeModal, setActiveModal, stories, activeStoryId } = useSky();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (activeModal !== 'story-view' || !activeStoryId) return null;

  const story = stories.find((s) => s.id === activeStoryId);
  if (!story || !story.pages || story.pages.length === 0) return null;

  const pages = story.pages;
  const currentPage = pages[currentPageIndex] || pages[0];
  const creatorName = story.creatorName || 'Cosmic Storyteller';
  const creatorAvatar = story.creatorAvatar;

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div
        className="modal-content story-viewer-window animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Creator Info */}
        <div className="story-viewer-header">
          <div className="viewer-title-row">
            <BookOpen size={20} className="icon-cyan" />
            <h3>{story.title || 'Relive a Day'}</h3>
          </div>

          <div className="viewer-header-right">
            <div className="creator-profile-badge" title={`Story by ${creatorName}`}>
              {creatorAvatar?.startsWith('emoji:') ? (
                <span className="creator-badge-emoji">{creatorAvatar.replace('emoji:', '')}</span>
              ) : creatorAvatar ? (
                <img src={creatorAvatar} alt={creatorName} className="creator-badge-avatar" />
              ) : (
                <User size={14} className="creator-badge-icon" />
              )}
              <span className="creator-badge-name">{creatorName}</span>
            </div>

            <button
              type="button"
              className="close-modal-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close story"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Flipbook Page Reader Body */}
        <div className="flipbook-reader-body">
          <div className={`flipbook-book-frame theme-${currentPage.theme} layout-${currentPage.layout}`}>
            {/* Layout 1: Text Only */}
            {currentPage.layout === 1 && (
              <div
                className={`page-text-container font-${currentPage.textStyle.font}`}
                style={{
                  color: currentPage.textStyle.color,
                  fontSize: `${currentPage.textStyle.size}px`,
                  fontWeight: currentPage.textStyle.bold ? 'bold' : 'normal',
                  fontStyle: currentPage.textStyle.italic ? 'italic' : 'normal',
                  textDecoration: currentPage.textStyle.underline ? 'underline' : 'none'
                }}
              >
                {currentPage.text}
              </div>
            )}

            {/* Layout 2: Image Only */}
            {currentPage.layout === 2 && (
              <div className="page-image-container full-image">
                {currentPage.imageUrl && (
                  <img src={currentPage.imageUrl} alt="Story memory" className="story-render-image" />
                )}
              </div>
            )}

            {/* Layout 3: Text Left + Image Right */}
            {currentPage.layout === 3 && (
              <div className="page-split-container">
                <div
                  className={`page-split-text font-${currentPage.textStyle.font}`}
                  style={{
                    color: currentPage.textStyle.color,
                    fontSize: `${currentPage.textStyle.size}px`,
                    fontWeight: currentPage.textStyle.bold ? 'bold' : 'normal',
                    fontStyle: currentPage.textStyle.italic ? 'italic' : 'normal',
                    textDecoration: currentPage.textStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {currentPage.text}
                </div>
                <div className="page-split-image">
                  {currentPage.imageUrl && (
                    <img src={currentPage.imageUrl} alt="Story memory" className="story-render-image" />
                  )}
                </div>
              </div>
            )}

            {/* Layout 4: Image Left + Text Right */}
            {currentPage.layout === 4 && (
              <div className="page-split-container">
                <div className="page-split-image">
                  {currentPage.imageUrl && (
                    <img src={currentPage.imageUrl} alt="Story memory" className="story-render-image" />
                  )}
                </div>
                <div
                  className={`page-split-text font-${currentPage.textStyle.font}`}
                  style={{
                    color: currentPage.textStyle.color,
                    fontSize: `${currentPage.textStyle.size}px`,
                    fontWeight: currentPage.textStyle.bold ? 'bold' : 'normal',
                    fontStyle: currentPage.textStyle.italic ? 'italic' : 'normal',
                    textDecoration: currentPage.textStyle.underline ? 'underline' : 'none'
                  }}
                >
                  {currentPage.text}
                </div>
              </div>
            )}

            {/* Stickers Overlay */}
            <StickerCanvasOverlay
              stickers={currentPage.stickers || []}
              isEditable={false}
            />

            <div className="page-footer-number">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          </div>
        </div>

        {/* Flipbook Navigation Controls */}
        <div className="story-viewer-footer-nav">
          <button
            type="button"
            className="viewer-nav-btn"
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="viewer-counter-badge">
            {currentPageIndex + 1} / {pages.length}
          </div>

          <button
            type="button"
            className="viewer-nav-btn"
            disabled={currentPageIndex === pages.length - 1}
            onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
