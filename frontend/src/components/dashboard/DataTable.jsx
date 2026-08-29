import React from 'react';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'Tidak ada data',
  emptyDescription = 'Belum ada data yang ditambahkan.',
  emptyActionLabel,
  onEmptyAction,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`admin-table-wrapper ${className}`}>
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {columns.map((col, idx) => (
                  <td key={idx}>
                    <Skeleton height="20px" width={idx === 0 ? "80%" : "60%"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={`admin-table-wrapper ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {typeof col.cell === 'function' ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
