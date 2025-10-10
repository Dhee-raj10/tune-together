import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

const MUSICIAN_ROLES = [
  { value: 'drummer', label: '🥁 Drummer' },
  { value: 'guitarist', label: '🎸 Guitarist' },
  { value: 'violinist', label: '🎻 Violinist' },
  { value: 'pianist', label: '🎹 Pianist' },
  { value: 'vocalist', label: '🎤 Vocalist' },
  { value: 'producer', label: '🎧 Producer' },
  { value: 'composer', label: '🎼 Composer' },
  { value: 'saxophonist', label: '🎷 Saxophonist' },
  { value: 'trumpeter', label: '🎺 Trumpeter' },
];

export const MusicianRoleSelector = ({ isOpen, onClose, userId }) => {
  const { updateUserRoles } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [otherRole, setOtherRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  // FIXED: Better error handling and loading states
  const handleSubmit = async () => {
    const finalRoles = [...selectedRoles];
    if (otherRole.trim()) {
      finalRoles.push(otherRole.trim());
    }

    // Check if the user selected any roles before saving
    if (finalRoles.length === 0) {
      toast({ 
        title: "Please select at least one role or click 'Skip'.", 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // CRITICAL FIX: Proper error handling with toast notifications
      await updateUserRoles(userId, finalRoles);
      
      toast({ 
        title: "Roles updated successfully!", 
        description: `Selected roles: ${finalRoles.join(', ')}`,
        variant: 'success' 
      });
      
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error updating roles:", error);
      
      toast({ 
        title: "Error updating roles", 
        description: error.message || "Failed to save your musician roles. Please try again.",
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Allow users to skip role selection
  const handleSkip = () => {
    toast({ 
      title: "Roles skipped", 
      description: "You can update your roles anytime from your profile.",
      variant: 'default' 
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Select Your Musical Roles</h2>
        <p className="text-gray-600 mb-6">
          Select the roles that best describe you. This will help others find you for collaboration.
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {MUSICIAN_ROLES.map((role) => (
            <label key={role.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.value)}
                onChange={() => handleRoleToggle(role.value)}
                disabled={isLoading}
                className="rounded"
              />
              <span className="text-sm">{role.label}</span>
            </label>
          ))}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Other (specify):
          </label>
          <input
            type="text"
            value={otherRole}
            onChange={(e) => setOtherRole(e.target.value)}
            placeholder="e.g., Sound Engineer, DJ"
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md"
          >
            {isLoading ? 'Saving...' : 'Save Roles'}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-md"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};