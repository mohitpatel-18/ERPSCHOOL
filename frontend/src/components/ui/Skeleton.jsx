import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4',
    title: 'h-8',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48',
    button: 'h-10 w-24',
  };

  return (
    <div className={`animate-pulse bg-gray-200 rounded ${variants[variant]} ${className}`} />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <Skeleton variant="title" className="w-1/3 mb-4" />
      <Skeleton className="w-full mb-2" />
      <Skeleton className="w-5/6 mb-2" />
      <Skeleton className="w-4/6" />
    </div>
  );
};

export default Skeleton;
