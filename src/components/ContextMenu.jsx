import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

/**
 * Context menu that appears when clicking the three-dot menu on chat items
 */
function ContextMenu({ chat, position, onClose, onStar, onRename, onAddToProject, onDelete }) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: position.top, left: position.left }}
    >
      <button className="context-menu-item" onClick={() => handleAction(() => onStar(chat.id))}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={chat.starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>{chat.starred ? 'Unstar' : 'Star'}</span>
      </button>

      <button className="context-menu-item" onClick={() => handleAction(() => onRename(chat.id))}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span>Rename</span>
      </button>

      <button className="context-menu-item" onClick={() => handleAction(() => onAddToProject(chat.id))}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Add to project</span>
      </button>

      <div className="context-menu-divider"></div>

      <button className="context-menu-item context-menu-item-danger" onClick={() => handleAction(() => onDelete(chat.id))}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>Delete</span>
      </button>
    </div>
  );
}

export default ContextMenu;
