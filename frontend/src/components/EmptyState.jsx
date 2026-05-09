import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({ message, actionButton = null }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <FolderOpen size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        There is currently no data to display here.
      </p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
