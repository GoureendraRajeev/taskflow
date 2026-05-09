import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${getStyles()}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
