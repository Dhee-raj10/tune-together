// src/components/UserProfile.js
import { useEffect, useState } from 'react';
import { MusicianRoleSelector } from './MusicianRoleSelector';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const UserProfile = ({ userId }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false); 

  const profileId = userId || user?.id;
  const isOwnProfile = !userId || (user && userId === user.id);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get(`/profiles/${profileId}`);
        setProfile(res.data);
        
        // Logic to show role selector if the user's fetched profile is missing roles
        if (isOwnProfile && (!res.data.roles || res.data.roles.length === 0)) {
          setIsRoleSelectorOpen(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Profile not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [profileId, isOwnProfile, user?.roles]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="alert alert-warning" role="alert">
        No profile data found.
      </div>
    );
  }

  const needsRoles = isOwnProfile && (!profile.roles || profile.roles.length === 0);

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body text-center p-4">
          <img
            src={profile.avatar_url || 'https://placehold.co/128x128'}
            className="rounded-circle mb-3"
            alt="User Avatar"
            style={{ width: '128px', height: '128px' }}
          />
          {profile.username && (
            <h1 className="h2 fw-bold">{profile.username}</h1>
          )}
          {profile.full_name && (
            <p className="text-muted">{profile.full_name}</p>
          )}
          {profile.roles && profile.roles.length > 0 && (
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
              {profile.roles.map(role => (
                <span key={role} className="badge bg-primary text-white">
                  {role}
                </span>
              ))}
            </div>
          )}
          {needsRoles && (
            <button
              onClick={() => setIsRoleSelectorOpen(true)}
              className="btn btn-link text-decoration-none mt-2"
            >
              Set your musician roles
            </button>
          )}
          
          {!needsRoles && isOwnProfile && (
            <button
              onClick={() => setIsRoleSelectorOpen(true)}
              className="btn btn-sm btn-outline-secondary mt-2"
            >
              Edit Roles
            </button>
          )}
        </div>
      </div>
      {profile && isOwnProfile && (
        <MusicianRoleSelector
          isOpen={isRoleSelectorOpen}
          onClose={() => setIsRoleSelectorOpen(false)}
          // Use profile._id which is the guaranteed MongoDB ID
          userId={profile._id || profile.id} 
        />
      )}
    </div>
  );
};