import React, { useState } from 'react';
import { formatFileSize, getFileExtension } from '../utils/fileProcessors';
import './FileLibrary.css';

function FileLibrary({ knowledgeBase, onRemoveFile, onFileClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const filteredFiles = knowledgeBase.filter(file =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (file) => {
    setSelectedFile(file.id === selectedFile?.id ? null : file);
    if (onFileClick) {
      onFileClick(file);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = getFileExtension(fileName);

    // PDF
    if (ext === '.pdf') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M9 15h2a1 1 0 0 1 1 1v2"></path>
        </svg>
      );
    }

    // Code files
    if (['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rs'].includes(ext)) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
    }

    // Markdown
    if (['.md', '.markdown'].includes(ext)) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 19h18M3 5h18M3 12h18"></path>
        </svg>
      );
    }

    // Default document
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
      </svg>
    );
  };

  if (knowledgeBase.length === 0) {
    return (
      <div className="file-library-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>No files in knowledge base</p>
        <span>Upload files to build your personal AI's memory</span>
      </div>
    );
  }

  return (
    <div className="file-library">
      <div className="file-library-header">
        <h3>Knowledge Base ({knowledgeBase.length})</h3>
        <div className="file-library-search">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="file-library-list">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`file-library-item ${selectedFile?.id === file.id ? 'selected' : ''}`}
          >
            <div className="file-library-item-header" onClick={() => handleFileClick(file)}>
              <div className="file-library-item-icon">
                {getFileIcon(file.fileName)}
              </div>
              <div className="file-library-item-info">
                <div className="file-library-item-name">{file.fileName}</div>
                <div className="file-library-item-meta">
                  {formatFileSize(file.fileSize)} • Added {new Date(file.addedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                className="file-library-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Remove "${file.fileName}" from knowledge base?`)) {
                    onRemoveFile(file.id);
                  }
                }}
                title="Remove file"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>

            {selectedFile?.id === file.id && (
              <div className="file-library-item-preview">
                <div className="file-library-item-preview-header">
                  <span>Preview</span>
                  <span className="file-library-item-preview-chars">
                    {file.content.length.toLocaleString()} characters
                  </span>
                </div>
                <div className="file-library-item-preview-content">
                  {file.content.slice(0, 500)}
                  {file.content.length > 500 && '...'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && searchQuery && (
        <div className="file-library-no-results">
          <p>No files match "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

export default FileLibrary;
