import React, { useRef, useState, useLayoutEffect } from 'react';
import { CardTextBox } from '../../types/celestial';

interface CardTextBoxItemProps {
  id: 'title' | 'body' | 'from';
  box: CardTextBox;
  onChange: (updatedBox: CardTextBox) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  isEditable?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export const CardTextBoxItem: React.FC<CardTextBoxItemProps> = ({
  id,
  box,
  onChange,
  isSelected = false,
  onSelect,
  isEditable = false,
  cardWidth = 360,
  cardHeight = 260,
  minWidth = 60,
  minHeight = 24
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fittedFontSize, setFittedFontSize] = useState<number>(box.style?.size || 14);
  const SAFE_MARGIN = 8;

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 });

  // Resizing state
  const isResizingRef = useRef(false);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0, dir: '' });

  // Auto font-fitting calculation
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const baseSize = box.style?.size || (id === 'title' ? 22 : id === 'body' ? 14 : 16);
    const minSize = id === 'title' ? 14 : id === 'body' ? 12 : 13;
    let size = baseSize;

    // Apply temporary size to measure overflow
    el.style.fontSize = `${size}px`;

    const availWidth = Math.max(1, box.width - SAFE_MARGIN * 2 - 8);
    const availHeight = Math.max(1, box.height - SAFE_MARGIN * 2);

    while (
      size > minSize &&
      (el.scrollHeight > availHeight || el.scrollWidth > availWidth)
    ) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }

    setFittedFontSize(size);
  }, [box.text, box.width, box.height, box.style?.size, box.style?.font, box.style?.bold, box.style?.italic, box.style?.underline, id]);

  // Handle Dragging
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (!isEditable) return;
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;

    if (onSelect) onSelect();

    isDraggingRef.current = true;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      boxX: box.x,
      boxY: box.y
    };

    const handleMouseMove = (me: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = me.clientX - dragStartPos.current.x;
      const dy = me.clientY - dragStartPos.current.y;

      const safeWidth = Math.max(1, cardWidth - SAFE_MARGIN * 2);
      const safeHeight = Math.max(1, cardHeight - SAFE_MARGIN * 2);
      const boundedWidth = Math.min(box.width, safeWidth);
      const boundedHeight = Math.min(box.height, safeHeight);
      const newX = Math.max(SAFE_MARGIN, Math.min(cardWidth - SAFE_MARGIN - boundedWidth, dragStartPos.current.boxX + dx));
      const newY = Math.max(SAFE_MARGIN, Math.min(cardHeight - SAFE_MARGIN - boundedHeight, dragStartPos.current.boxY + dy));

      onChange({
        ...box,
        x: Math.round(newX),
        y: Math.round(newY)
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Resizing
  const handleMouseDownResize = (e: React.MouseEvent, dir: string) => {
    if (!isEditable) return;
    e.stopPropagation();
    e.preventDefault();

    if (onSelect) onSelect();

    isResizingRef.current = true;
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: box.width,
      height: box.height,
      dir
    };

    const handleMouseMove = (me: MouseEvent) => {
      if (!isResizingRef.current) return;
      const dx = me.clientX - resizeStartPos.current.x;
      const dy = me.clientY - resizeStartPos.current.y;

      let newWidth = box.width;
      let newHeight = box.height;

      const safeWidth = Math.max(minWidth, cardWidth - SAFE_MARGIN * 2 - box.x);
      const safeHeight = Math.max(minHeight, cardHeight - SAFE_MARGIN * 2 - box.y);
      if (dir.includes('e')) {
        newWidth = Math.max(minWidth, Math.min(safeWidth, resizeStartPos.current.width + dx));
      }
      if (dir.includes('s')) {
        newHeight = Math.max(minHeight, Math.min(safeHeight, resizeStartPos.current.height + dy));
      }

      onChange({
        ...box,
        width: Math.round(newWidth),
        height: Math.round(newHeight)
      });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const fontClass = `font-${box.style?.font || (id === 'title' ? 'elegant' : id === 'body' ? 'modern' : 'cursive')}`;

  return (
    <div
      ref={containerRef}
      className={`card-text-box-wrapper ${isSelected ? 'active-selection' : ''} ${isEditable ? 'editable' : ''}`}
      style={{
        position: 'absolute',
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        boxSizing: 'border-box',
        cursor: isEditable ? 'move' : 'default',
        zIndex: isSelected ? 12 : 10
      }}
      onMouseDown={handleMouseDownDrag}
      onClick={() => isEditable && onSelect && onSelect()}
    >
      <div
        ref={contentRef}
        className={`card-text-box-content ${fontClass}`}
        style={{
          width: '100%',
          height: '100%',
          color: box.style?.color || '#ffffff',
          fontSize: `${fittedFontSize}px`,
          fontWeight: box.style?.bold ? 'bold' : 'normal',
          fontStyle: box.style?.italic ? 'italic' : 'normal',
          textDecoration: box.style?.underline ? 'underline' : 'none',
          lineHeight: id === 'body' ? 1.35 : 1.2,
          textAlign: 'center',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: `${SAFE_MARGIN / 2}px ${SAFE_MARGIN}px`,
          boxSizing: 'border-box'
        }}
        dangerouslySetInnerHTML={{ __html: box.text || '' }}
      />

      {/* Editable Handles & Selection Border */}
      {isEditable && isSelected && (
        <>
          <div className="card-box-outline-ring" />
          <div
            className="resize-handle handle-se"
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            title="Resize text box"
          />
          <div
            className="resize-handle handle-e"
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            title="Resize width"
          />
          <div
            className="resize-handle handle-s"
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            title="Resize height"
          />
        </>
      )}
    </div>
  );
};
