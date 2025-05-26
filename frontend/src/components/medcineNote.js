import React from 'react';

export default function medcineNote() {
  return (
    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-4">
      <strong>Note:</strong> Please enter the <span className="font-semibold">generic name</span> of the medicine, not the brand name. 
      For example, use <span className="italic">"acetaminophen"</span> instead of <span className="italic">"Tylenol"</span>.
    </div>
  );
}
