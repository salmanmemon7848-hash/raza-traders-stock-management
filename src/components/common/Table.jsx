import React from 'react';
import EmptyState from './EmptyState';

const Table = ({
  columns,
  data,
  onRowClick,
  className = '',
  emptyTitle = 'No data',
  emptyDescription,
  emptyIcon,
  emptyAction,
  // For mobile card view: render each row as a card via renderCard(row)
  renderCard,
}) => {
  const isEmpty = !data || data.length === 0;

  return (
    <>
      {/* Desktop table */}
      <div className={`hidden md:block ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((column, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap
                      ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isEmpty ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8">
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 text-sm text-slate-700
                          ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {column.render ? column.render(row) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className={`md:hidden ${className}`}>
        {isEmpty ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        ) : (
          <div className="space-y-2.5">
            {data.map((row, rowIndex) => (
              <div
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`bg-white border border-slate-200 rounded-xl p-3.5
                  ${onRowClick ? 'cursor-pointer active:bg-slate-50' : ''}`}
              >
                {renderCard ? renderCard(row) : (
                  <div className="space-y-1.5">
                    {columns.map((column, colIndex) => {
                      const v = column.render ? column.render(row) : row[column.accessor];
                      return (
                        <div key={colIndex} className="flex justify-between gap-3 text-sm">
                          <span className="text-slate-500 font-medium">{column.header}</span>
                          <span className="text-slate-900 text-right break-words">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Table;
