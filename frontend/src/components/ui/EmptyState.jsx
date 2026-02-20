import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  actionLabel 
}) => {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
