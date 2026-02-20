import React from 'react';

export const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 bg-gray-300 dark:bg-dark-700 rounded-2xl skeleton" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded skeleton w-1/3" />
        <div className="h-8 bg-gray-300 dark:bg-dark-700 rounded skeleton w-2/3" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="card">
    <div className="space-y-4">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 dark:bg-dark-700 rounded skeleton" />
        ))}
      </div>
      
      <div className="divider" />
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-6 bg-gray-300 dark:bg-dark-700 rounded skeleton" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="card h-80 animate-pulse">
    <div className="h-6 bg-gray-300 dark:bg-dark-700 rounded skeleton w-1/3 mb-6" />
    <div className="flex items-end justify-between h-48 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div 
          key={i} 
          className="flex-1 bg-gray-300 dark:bg-dark-700 rounded-t skeleton"
          style={{ height: `${Math.random() * 70 + 30}%` }}
        />
      ))}
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 bg-gray-300 dark:bg-dark-700 rounded-full skeleton" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-300 dark:bg-dark-700 rounded skeleton w-1/3" />
        <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded skeleton w-1/2" />
        <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded skeleton w-2/3" />
      </div>
    </div>
  </div>
);

const SkeletonLoader = ({ type = 'card', ...props }) => {
  const types = {
    card: <SkeletonCard {...props} />,
    table: <SkeletonTable {...props} />,
    chart: <SkeletonChart {...props} />,
    profile: <SkeletonProfile {...props} />,
  };

  return types[type] || types.card;
};

export default SkeletonLoader;
