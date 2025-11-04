import React from 'react';
import InputBox from './InputBox';
import './EmptyState.css';

/**
 * Empty state shown when no chat is active
 * Features centered input and action buttons
 */
function EmptyState({
  input,
  setInput,
  onSend,
  isLoading,
  selectedImages,
  onRemoveImage,
  onImageUpload,
  onActionClick
}) {
  const actionButtons = [
    { id: 'write', label: 'Write', icon: '✍️' },
    { id: 'learn', label: 'Learn', icon: '📚' },
    { id: 'code', label: 'Code', icon: '💻' },
    { id: 'life', label: 'Life stuff', icon: '🌱' },
    { id: 'surprise', label: "AI's choice", icon: '✨' },
  ];

  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <h1 className="empty-state-greeting">How can I help you today?</h1>

        <InputBox
          input={input}
          setInput={setInput}
          onSend={onSend}
          isLoading={isLoading}
          centered={true}
          selectedImages={selectedImages}
          onRemoveImage={onRemoveImage}
          onImageUpload={onImageUpload}
        />

        <div className="action-buttons">
          {actionButtons.map((action) => (
            <button
              key={action.id}
              className="action-button"
              onClick={() => onActionClick(action.id)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="keyboard-shortcuts">
          <div className="keyboard-shortcuts-title">Keyboard shortcuts</div>
          <div className="keyboard-shortcuts-list">
            <div className="keyboard-shortcut">
              <kbd>Ctrl</kbd> + <kbd>N</kbd> New chat
            </div>
            <div className="keyboard-shortcut">
              <kbd>Ctrl</kbd> + <kbd>D</kbd> Toggle theme
            </div>
            <div className="keyboard-shortcut">
              <kbd>Ctrl</kbd> + <kbd>B</kbd> Toggle sidebar
            </div>
            <div className="keyboard-shortcut">
              <kbd>Ctrl</kbd> + <kbd>U</kbd> Knowledge base
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
