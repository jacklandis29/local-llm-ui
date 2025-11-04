import React, { useRef, useEffect } from 'react';
import './InputBox.css';

/**
 * Input box component that can be centered (empty state) or at bottom (active chat)
 */
function InputBox({
  input,
  setInput,
  onSend,
  isLoading,
  centered = false,
  selectedImages = [],
  onRemoveImage,
  onImageUpload,
  placeholder = "Message..."
}) {
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          const scrollHeight = textareaRef.current.scrollHeight;
          textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
      });
    }
  }, [input]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileInputChange = (e) => {
    if (onImageUpload) {
      onImageUpload(e);
      // Reset file input after upload so same file can be selected again
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`input-box-container ${centered ? 'centered' : 'bottom'}`}>
      {/* Image previews */}
      {selectedImages.length > 0 && (
        <div className="input-image-previews">
          {selectedImages.map((img) => (
            <div key={img.id} className="input-image-preview">
              <img src={img.data} alt={img.name} />
              <button
                className="input-image-remove"
                onClick={() => onRemoveImage(img.id)}
                title="Remove image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-box-wrapper">
        {/* Hidden file input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Image upload button */}
        <button
          className="input-box-icon-btn"
          onClick={() => imageInputRef.current?.click()}
          disabled={isLoading}
          title="Upload image (or paste with Ctrl+V)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows="1"
          disabled={isLoading}
          className="input-box-textarea"
        />

        <button
          onClick={onSend}
          disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
          className="input-box-send-btn"
          title="Send message (Enter)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default InputBox;
