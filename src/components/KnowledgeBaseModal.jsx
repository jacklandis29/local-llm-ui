import React, { useState } from 'react';
import FileUpload from './FileUpload';
import FileLibrary from './FileLibrary';
import './KnowledgeBaseModal.css';

function KnowledgeBaseModal({ isOpen, onClose, knowledgeBase, onAddFiles, onRemoveFile, isProcessing, processingStatus }) {
  const [activeTab, setActiveTab] = useState('library');

  if (!isOpen) return null;

  const handleFilesSelected = async (files) => {
    await onAddFiles(files);
    // Switch to library tab after upload
    setActiveTab('library');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalSize = knowledgeBase.reduce((sum, file) => sum + file.fileSize, 0);
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="knowledge-base-modal-backdrop" onClick={handleBackdropClick}>
      <div className="knowledge-base-modal">
        <div className="knowledge-base-modal-header">
          <h2>Knowledge Base</h2>
          <button className="knowledge-base-modal-close" onClick={onClose} title="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="knowledge-base-stats">
          <div className="knowledge-base-stat">
            <span className="knowledge-base-stat-label">Files</span>
            <span className="knowledge-base-stat-value">{knowledgeBase.length}</span>
          </div>
          <div className="knowledge-base-stat">
            <span className="knowledge-base-stat-label">Total Size</span>
            <span className="knowledge-base-stat-value">{formatBytes(totalSize)}</span>
          </div>
        </div>

        <div className="knowledge-base-tabs">
          <button
            className={`knowledge-base-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            Library
          </button>
          <button
            className={`knowledge-base-tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload
          </button>
        </div>

        <div className="knowledge-base-modal-content">
          {processingStatus && (
            <div className="knowledge-base-processing">
              <div className="knowledge-base-processing-spinner"></div>
              <span>{processingStatus}</span>
            </div>
          )}

          {activeTab === 'library' && (
            <FileLibrary
              knowledgeBase={knowledgeBase}
              onRemoveFile={onRemoveFile}
            />
          )}

          {activeTab === 'upload' && (
            <div className="knowledge-base-upload-tab">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
              />
              <div className="knowledge-base-upload-info">
                <h4>Building Your Personal AI</h4>
                <p>
                  Upload documents, notes, code, and any text-based files to build your AI's knowledge base.
                  These files will be available as context in your conversations, helping your AI understand
                  your work, projects, and personal information.
                </p>
                <ul>
                  <li>Files are stored locally in your browser</li>
                  <li>Content is included automatically in relevant conversations</li>
                  <li>Your AI remembers information across model updates</li>
                  <li>Perfect for project documentation, personal notes, and code</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBaseModal;
