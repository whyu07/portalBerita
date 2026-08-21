import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb - Semantic navigation breadcrumb.
 * items: Array of { label, to } objects. Last item is current page (no link).
 */
export const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
      }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {index > 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
              {isLast ? (
                <span
                  aria-current="page"
                  style={{
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  style={{
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
