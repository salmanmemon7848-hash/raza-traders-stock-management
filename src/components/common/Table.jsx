import React from 'react';

const Table = ({ columns, data, onRowClick, className = '', enableCardView = false }) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className={`overflow-x-auto ${className} hidden md:block`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-8 text-center text-gray-500 text-sm"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {enableCardView && (
        <div className={`md:hidden space-y-3 ${className}`}>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No data available
            </div>
          ) : (
            data.map((row, rowIndex) => (
              <div
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                {columns.map((column, colIndex) => {
                  const value = column.render ? column.render(row) : row[column.accessor];
                  // Don't render action buttons in card view if they're already shown elsewhere
                  if (column.header === 'Actions') return null;
                  
                  return (
                    <div key={colIndex} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100">
                      <span className="text-xs font-semibold text-gray-600 uppercase">{column.header}</span>
                      <span className="text-sm text-gray-900 text-right">{value}</span>
                    </div>
                  );
                })}
                
                {/* Show actions separately in card view */}
                {columns.find(col => col.header === 'Actions') && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    {columns.find(col => col.header === 'Actions').render?.(row)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Fallback when card view is disabled - show simple responsive table */}
      {!enableCardView && (
        <div className={`overflow-x-auto md:hidden ${className} table-responsive`}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 max-w-[150px] truncate">
                        {column.render ? column.render(row) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Table;
