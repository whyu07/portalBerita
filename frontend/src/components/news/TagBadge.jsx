import React from 'react';
import { Link } from 'react-router-dom';

export const TagBadge = ({ tag, className = '', style = {}, asLink = true }) => {
  if (!tag) return null;
  
  const content = `#${tag.name}`;
  const badgeClass = `badge-tag ${className}`;

  if (asLink && tag.slug) {
    return (
      <Link to={`/tag/${tag.slug}`} className={badgeClass} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <span className={badgeClass} style={style}>
      {content}
    </span>
  );
};
