import React from 'react';
import './PerformanceBar.css';

function PerformanceBar({ tokensPerSecond, totalTokens, responseTime, isStreaming }) {
  if (!isStreaming && (!tokensPerSecond && !totalTokens && !responseTime)) {
    return null;
  }

  return (
    <div className="performance-bar">
      <div className="performance-stat">
        <span className="performance-label">Speed:</span>
        <span className="performance-value">
          {tokensPerSecond ? `${tokensPerSecond.toFixed(1)} tokens/s` : '—'}
        </span>
      </div>
      <div className="performance-stat">
        <span className="performance-label">Tokens:</span>
        <span className="performance-value">
          {totalTokens ? `${totalTokens.toLocaleString()}` : '—'}
        </span>
      </div>
      <div className="performance-stat">
        <span className="performance-label">Time:</span>
        <span className="performance-value">
          {responseTime ? `${(responseTime / 1000).toFixed(1)}s` : '—'}
        </span>
      </div>
      {isStreaming && (
        <div className="performance-indicator">
          <span className="streaming-dot"></span>
          <span>Streaming</span>
        </div>
      )}
    </div>
  );
}

export default PerformanceBar;


