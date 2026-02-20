import React from 'react';
import Input from './Input';
import Select from './Select';

const FormGroup = ({ children, columns = 1, gap = 4 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols[columns]} ${gapClass}`}>
      {children}
    </div>
  );
};

export { FormGroup, Input, Select };
