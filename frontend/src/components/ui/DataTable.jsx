import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronUp, FiChevronDown, FiSearch, FiDownload } from 'react-icons/fi';

const DataTable = ({ 
  columns = [], 
  data = [], 
  searchable = true,
  sortable = true,
  exportable = false,
  onRowClick,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Search & Filter
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    return columns.some(col => {
      const value = row[col.key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',');
    const rows = sortedData.map(row => 
      columns.map(col => row[col.key]).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
  };

  return (
    <div className={`glass-card ${className}`}>
      {/* Header with search and export */}
      {(searchable || exportable) && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
          )}
          
          {exportable && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-700/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`
                    px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider
                    ${sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortable && sortConfig.key === col.key && (
                      <span className="text-primary-500">
                        {sortConfig.direction === 'asc' ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
            {sortedData.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10' : ''}
                  transition-colors
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {sortedData.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No data found</p>
        </div>
      )}

      {/* Footer with count */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-dark-700 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedData.length} of {data.length} entries
      </div>
    </div>
  );
};

export default DataTable;
