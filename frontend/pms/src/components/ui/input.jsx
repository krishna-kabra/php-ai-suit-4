import React from 'react';

export const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <input {...props} className="border rounded w-full p-2" />
  </div>
);
