import React from 'react';
import { Button } from '../common/Button';

export const FilterBar = ({
  filters = [], // array of { key, label, type, options, value, onChange }
  onReset,
  className = ''
}) => {
  return (
    <div className={`ui-panel d-flex flex-wrap ${className}`} style={{ gap: '1rem', marginBottom: '2rem' }}>
      {filters.map((filter, idx) => (
        <div key={idx} className="form-group flex-1" style={{ minWidth: filter.type === 'date' ? '150px' : '200px', margin: 0 }}>
          <label className="form-label">{filter.label}</label>
          
          {filter.type === 'select' ? (
            <select 
              className="form-control" 
              value={filter.value || ''}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              <option value="">{filter.placeholder || 'Semua'}</option>
              {filter.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input 
              type={filter.type || 'text'}
              className="form-control" 
              value={filter.value || ''}
              onChange={(e) => filter.onChange(e.target.value)}
              placeholder={filter.placeholder}
              {...(filter.min ? { min: filter.min } : {})}
              {...(filter.max ? { max: filter.max } : {})}
            />
          )}
        </div>
      ))}
      
      {onReset && (
        <div className="d-flex" style={{ alignItems: 'flex-end', flex: '1 1 100px' }}>
          <Button variant="outline" onClick={onReset} style={{ width: '100%', height: '42px' }}>
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
};
