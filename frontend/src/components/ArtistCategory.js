import React from 'react';

export function ArtistCategory({ icon, label, isSelected = false, onClick }) {
  return (
    <button
      type="button"
      className={`btn d-flex align-items-center gap-2 ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
