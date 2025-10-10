import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Use the actual API instance

// Note: Removed unused mock imports/functions

/**
 * Lists available user profiles, filtered by selected musician roles.
 * When a user clicks 'Collaborate', it calls the onCollaborate handler with the profile data.
 */
export const ProfileList = ({ selectedRoles = [], onCollaborate }) => {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        // Construct query string for roles
        const roleQuery = selectedRoles.length > 0 ? `?roles=${selectedRoles.join(',')}` : '';
        
        // Use the actual backend API endpoint
        const res = await api.get(`/profiles${roleQuery}`);
        
        setProfiles(res.data);

      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [selectedRoles]);

  // Handler for the Collaborate button
  const handleCollaborate = (profile) => {
    if (onCollaborate) {
        // CRITICAL: Pass the entire profile object back to the parent component (FindCollaborators.js)
        onCollaborate(profile);
    } else {
        // Fallback action (e.g., viewing profile details)
        navigate(`/profile/${profile._id || profile.id}`);
    }
  };


  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {profiles.map((profile) => (
        // Use _id from MongoDB if available, fallback to id
        <div key={profile._id || profile.id} className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <img
                  src={profile.avatar_url || 'https://placehold.co/40x40'}
                  className="rounded-circle me-3"
                  alt="Avatar"
                  style={{ width: '40px', height: '40px' }}
                />
                <div>
                  <h5 className="mb-0 fw-bold">{profile.username || 'Unknown User'}</h5>
                  <p className="mb-0 text-muted">{profile.full_name}</p>
                </div>
              </div>
              {profile.roles && profile.roles.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      className={`badge ${selectedRoles.includes(role) ? 'bg-primary' : 'bg-secondary'}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer bg-white border-0">
              <button
                onClick={() => handleCollaborate(profile)}
                className="btn btn-primary w-100"
              >
                Collaborate
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
