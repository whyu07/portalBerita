import React from 'react';
import DOMPurify from 'dompurify';

/**
 * ArticleContent - Renders article HTML content safely.
 * Content is sanitized by the backend (bluemonday) AND
 * additionally sanitized on the client via DOMPurify (defense-in-depth).
 * Plain text articles (legacy) are rendered with preserved whitespace.
 */
export const ArticleContent = ({ content }) => {
  if (!content) return null;

  // Check if content contains HTML tags
  const isHTML = /<[a-z][\s\S]*>/i.test(content);

  if (isHTML) {
    // Defense-in-depth: sanitize HTML on client side too
    const cleanHTML = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'a', 'img', 'figure', 'figcaption', 'iframe',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div',
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel',
        'src', 'alt', 'width', 'height', 'loading',
        'frameborder', 'allow', 'allowfullscreen',
        'class', 'style',
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    });

    return (
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: cleanHTML }}
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
