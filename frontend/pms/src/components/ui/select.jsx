// src/components/ui/select.jsx
import React from 'react';

export const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <select {...props} className="border rounded w-full p-2">
      {children}
    </select>
  </div>
);

export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);
