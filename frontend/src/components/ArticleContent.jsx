import React from 'react';

/**
 * ArticleContent - Renders article HTML content safely.
 * Content is sanitized by the backend (bluemonday).
 * Plain text articles (legacy) are rendered with preserved whitespace.
 */
export const ArticleContent = ({ content }) => {
  if (!content) return null;

  // Check if content contains HTML tags
  const isHTML = /<[a-z][\s\S]*>/i.test(content);

  if (isHTML) {
    return (
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Legacy plain text: render with preserved whitespace
  return (
    <div className="article-content" style={{ whiteSpace: 'pre-line' }}>
      {content}
    </div>
  );
};
