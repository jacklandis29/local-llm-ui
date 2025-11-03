import React, { useState, useRef } from 'react';
import { MAX_FILE_SIZE } from '../constants';
import { getSupportedFileTypes, formatFileSize } from '../utils/fileProcessors';
import './FileUpload.css';

function FileUpload({ onFilesSelected, isProcessing }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleFiles = (files) => {
    // Filter out files that are too large
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const supportedTypes = getSupportedFileTypes();
  const allExtensions = [
    ...supportedTypes.documents,
    ...supportedTypes.code,
    ...supportedTypes.data,
    ...supportedTypes.web,
  ];

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
          accept={allExtensions.join(',')}
          disabled={isProcessing}
        />

        <div className="file-upload-icon">
          {isProcessing ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          )}
        </div>

        <div className="file-upload-text">
          {isProcessing ? (
            <p>Processing files...</p>
          ) : (
            <>
              <p className="file-upload-primary">
                Drop files here or click to browse
              </p>
              <p className="file-upload-secondary">
                Supports PDF, DOCX, TXT, Markdown, code files, and more
              </p>
              <p className="file-upload-tertiary">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="file-upload-info">
        <details>
          <summary>Supported file types</summary>
          <div className="file-types-grid">
            <div className="file-type-category">
              <strong>Documents</strong>
              <span>{supportedTypes.documents.join(', ')}</span>
            </div>
            <div className="file-type-category">
              <strong>Code</strong>
              <span>{supportedTypes.code.join(', ')}</span>
            </div>
            <div className="file-type-category">
              <strong>Data</strong>
              <span>{supportedTypes.data.join(', ')}</span>
            </div>
            <div className="file-type-category">
              <strong>Web</strong>
              <span>{supportedTypes.web.join(', ')}</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default FileUpload;
