import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

function MyProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userProfile, setUserProfile] = useState(null);
  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('Current user:', user);
    loadProjects();
    loadUserProfile();
    loadUserInstruments();
  }, [user, navigate]);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }
      
      console.log('Fetching projects');
      
      const response = await api.get('/projects');
      console.log('Projects response:', response.data);
      
      setProjects(response.data || []);
      setError(null);

    } catch (error) {
      console.error('Error loading projects:', error);

      if (error.response?.status === 401) {
        toast({ title: 'Session expired. Please login again.', variant: 'error' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(error.response?.data?.error || 'Failed to load projects');
      }

    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userId = user.id || user._id;
      const response = await api.get(`/profiles/${userId}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserInstruments = async () => {
    try {
      const response = await api.get('/musicians/my-instruments');
      setInstruments(response.data.instruments || []);
    } catch (error) {
      console.error('Error loading instruments:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <h4>Loading...</h4>
        <p>Loading your projects...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container py-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>My Projects</h2>
            <p className="text-muted">Manage your music projects and collaborations</p>
          </div>
          
          <button className="btn btn-primary" onClick={() => navigate('/explore')}>
            New Project
          </button>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <div className="card mb-4 p-3">
            <div className="d-flex align-items-center">
              <img
                src={userProfile.avatar_url || 'https://via.placeholder.com/80'}
                alt="Profile"
                className="rounded-circle me-3"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />

              <div className="flex-grow-1">
                <h5 className="mb-1">{userProfile.username}</h5>

                {userProfile.roles?.length > 0 && (
                  <p className="mb-1">
                    <strong>Roles:</strong> {userProfile.roles.join(', ')}
                  </p>
                )}

                {instruments.length > 0 && (
                  <p className="mb-1">
                    <strong>Instruments:</strong> 
                    {instruments.map(inst => ` ${inst.instrument} (${inst.skillLevel})${inst.isPrimary ? ' ⭐' : ''}`)}
                  </p>
                )}

                {( !userProfile.roles || userProfile.roles.length === 0 || instruments.length === 0 ) && (
                  <p className="text-warning mb-1">
                    Complete your profile to be discovered by other musicians!
                  </p>
                )}
              </div>

              <button className="btn btn-outline-primary" onClick={() => navigate('/profile')}>
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="text-center p-5 border rounded">
            <h4>No projects created yet</h4>
            <p>Start your musical journey by creating your first project!</p>
            
            <button className="btn btn-primary me-2" onClick={() => navigate('/create/solo')}>
              Create Solo Project
            </button>

            <button className="btn btn-success" onClick={() => navigate('/find-collaborators')}>
              Find Collaborators
            </button>
          </div>
        ) : (
          <div className="row">
            {projects.map(project => {
              const isCollab = project.mode === 'collaborative';
              const projectLink = isCollab 
                ? `/collaboration-workspace/${project._id}` 
                : `/music-studio/${project._id}`;

              return (
                <div className="col-md-4 mb-3" key={project._id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{project.title || project.name}</h5>
                      <p className="text-muted mb-2">
                        {project.description?.slice(0, 80)}...
                      </p>

                      <p className="small text-secondary">
                        {project.tracks?.length || 0} Tracks · {project.tempo || 120} BPM
                      </p>

                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => navigate(projectLink)}
                      >
                        Open Studio
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <Footer />
    </>
  );
}

export default MyProjects;
