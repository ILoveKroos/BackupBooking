import React from 'react';

function VoucherIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7a2 2 0 0 1 2-2h16v5a2 2 0 0 0 0 4v5H6a2 2 0 0 1-2-2v-5a2 2 0 0 0 0-4z" />
      <path d="M10 9h.01" />
      <path d="M16 15h.01" />
      <path d="M17 8l-8 8" />
    </svg>
  );
}

export default VoucherIcon;
