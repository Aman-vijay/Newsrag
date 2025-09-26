// src/components/SourcesList/SourcesList.jsx
import React, { useState } from 'react';
import './SourcesList.scss';

const SourcesList = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!sources || sources.length === 0) {
    return null;
  }

  const displayedSources = isExpanded ? sources : sources.slice(0, 2);
  const hasMore = sources.length > 2;

  const formatScore = (score) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  };

  const truncateTitle = (title, maxLength = 80) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <div className="sources-list">
      <div className="sources-header">
        <span className="sources-icon">📰</span>
        <span className="sources-title">Sources ({sources.length})</span>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-button"
            aria-label={isExpanded ? 'Show fewer sources' : 'Show more sources'}
          >
            <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
        )}
      </div>

      <div className="sources-content">
        {displayedSources.map((source, index) => (
          <div key={index} className="source-item">
            <a
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
              title={source.title}
            >
              <div className="source-info">
                <span className="source-title">
                  {truncateTitle(source.title)}
                </span>
                <div className="source-meta">
                  <span className={`source-score ${getScoreColor(source.score)}`}>
                    {formatScore(source.score)} match
                  </span>
                  <span className="source-indicator">↗</span>
                </div>
              </div>
            </a>
          </div>
        ))}

        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="show-more-button"
          >
            + {sources.length - 2} more sources
          </button>
        )}
      </div>
    </div>
  );
};

export default SourcesList;