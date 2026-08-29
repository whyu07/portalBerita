import React from 'react';
import { Link } from 'react-router-dom';

export const CategoryBadge = ({ category, className = '', style = {}, asLink = true }) => {
  if (!category) return null;
  
  const content = category.name;
  const badgeClass = `badge-category ${className}`;

  if (asLink && category.slug) {
    return (
      <Link to={`/category/${category.slug}`} className={badgeClass} style={style}>
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
