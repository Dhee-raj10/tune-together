import React, { useState } from 'react';
import { ArtistCategory } from './ArtistCategory';

export const CollaboratorSelector = ({ onSelectRoles }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleRoleToggle = (role) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    
    setSelectedRoles(newRoles);
    onSelectRoles(newRoles);
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      {ARTIST_TYPES.map(artist => (
        <button
          key={artist.value}
          type="button"
          className={`btn ${selectedRoles.includes(artist.value) ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleRoleToggle(artist.value)}
        >
          {artist.label}
        </button>
      ))}
    </div>
  );
};

// NOTE: The original file had these icons and a separate component 'ArtistCategory'.
// For simplicity, these have been replaced with a simple button and the hardcoded array.
const ARTIST_TYPES = [
  { label: 'Drummer', value: 'drummer' },
  { label: 'Pianist', value: 'pianist' },
  { label: 'Guitarist', value: 'guitarist' },
  { label: 'Vocalist', value: 'vocalist' },
  { label: 'Producer', value: 'producer' },
  { label: 'Composer', value: 'composer' }
];

// The icons themselves are omitted, but could be added using Bootstrap Icons.
// Example: <i className="bi bi-drum"></i>
