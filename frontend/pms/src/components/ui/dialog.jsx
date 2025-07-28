import React from 'react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 max-w-md w-full relative">
        <button onClick={() => onOpenChange(false)} className="absolute top-2 right-2 text-gray-500">✕</button>
        {children}
      </div>
    </div>
  );
};

export const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold mb-4">{children}</h2>
);

export const DialogContent = ({ children }) => (
  <div className="space-y-4">{children}</div>
);
