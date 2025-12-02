// frontend/src/pages/MyProjects.js - PURPLE THEME
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
    
    loadProjects();
    loadUserProfile();
    loadUserInstruments();
  }, [user, navigate]);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await api.get('/projects');
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
      <div className="text-center p-5" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)'
      }}>
        <div className="spinner-border" style={{ color: '#a78bfa' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-3" style={{ color: '#e9d5ff' }}>Loading projects...</h4>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)'
    }}>
      <Navbar />

      <div className="container py-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ color: '#e9d5ff' }}>My Projects</h2>
            <p className="text-muted" style={{ color: '#c4b5fd' }}>
              Manage your music projects and collaborations
            </p>
          </div>
          
          <button 
            className="btn btn-lg"
            onClick={() => navigate('/explore')}
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontWeight: 'bold',
              border: 'none',
              boxShadow: '0 4px 20px rgba(167, 139, 250, 0.4)'
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            New Project
          </button>
        </div>

        {/* User Profile Card */}
        {userProfile && (
          <div className="card mb-4 p-3" style={{
            background: 'rgba(196, 181, 253, 0.15)',
            border: '2px solid #a78bfa',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(167, 139, 250, 0.2)'
          }}>
            <div className="d-flex align-items-center">
              <img
                src={userProfile.avatar_url || 'https://via.placeholder.com/80'}
                alt="Profile"
                className="rounded-circle me-3"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  objectFit: 'cover',
                  border: '3px solid #a78bfa'
                }}
              />

              <div className="flex-grow-1">
                <h5 className="mb-1" style={{ color: '#e9d5ff' }}>
                  {userProfile.username}
                </h5>

                {userProfile.roles?.length > 0 && (
                  <p className="mb-1" style={{ color: '#c4b5fd' }}>
                    <strong>Roles:</strong> {userProfile.roles.join(', ')}
                  </p>
                )}

                {instruments.length > 0 && (
                  <p className="mb-1" style={{ color: '#c4b5fd' }}>
                    <strong>Instruments:</strong> 
                    {instruments.map(inst => ` ${inst.instrument} (${inst.skillLevel})${inst.isPrimary ? ' ⭐' : ''}`)}
                  </p>
                )}

                {(!userProfile.roles || userProfile.roles.length === 0 || instruments.length === 0) && (
                  <p className="mb-1" style={{ 
                    color: '#fbbf24',
                    fontWeight: 'bold'
                  }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Complete your profile to be discovered by other musicians!
                  </p>
                )}
              </div>

              <button 
                className="btn"
                onClick={() => navigate('/profile')}
                style={{
                  background: 'rgba(167, 139, 250, 0.3)',
                  border: '2px solid #a78bfa',
                  color: '#e9d5ff',
                  fontWeight: 'bold'
                }}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert" style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid #ef4444',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="text-center p-5 rounded" style={{
            background: 'rgba(196, 181, 253, 0.1)',
            border: '2px dashed #a78bfa'
          }}>
            <i className="bi bi-music-note-beamed" style={{ 
              fontSize: '5rem', 
              color: '#a78bfa',
              opacity: 0.5 
            }}></i>
            <h4 className="mt-3" style={{ color: '#e9d5ff' }}>
              No projects created yet
            </h4>
            <p style={{ color: '#c4b5fd' }}>
              Start your musical journey by creating your first project!
            </p>
            
            <button 
              className="btn btn-lg me-2"
              onClick={() => navigate('/create/solo')}
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                border: 'none'
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Create Solo Project
            </button>

            <button 
              className="btn btn-lg"
              onClick={() => navigate('/find-collaborators')}
              style={{
                background: 'rgba(167, 139, 250, 0.3)',
                border: '2px solid #a78bfa',
                color: '#e9d5ff',
                fontWeight: 'bold'
              }}
            >
              <i className="bi bi-people me-2"></i>
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
                  <div className="card h-100" style={{
                    background: 'rgba(196, 181, 253, 0.15)',
                    border: '2px solid #a78bfa',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(167, 139, 250, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title" style={{ color: '#e9d5ff' }}>
                          {project.title || project.name}
                        </h5>
                        <span className="badge" style={{
                          background: isCollab 
                            ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' 
                            : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                          color: '#ffffff'
                        }}>
                          {isCollab ? 'Collab' : 'Solo'}
                        </span>
                      </div>

                      <p className="text-muted mb-2" style={{ color: '#c4b5fd' }}>
                        {project.description?.slice(0, 80)}...
                      </p>

                      <div className="d-flex gap-3 mb-3" style={{ color: '#c4b5fd' }}>
                        <small>
                          <i className="bi bi-music-note-list me-1"></i>
                          {project.tracks?.length || 0} Tracks
                        </small>
                        <small>
                          <i className="bi bi-speedometer2 me-1"></i>
                          {project.tempo || 120} BPM
                        </small>
                      </div>

                      <button 
                        className="btn w-100"
                        onClick={() => navigate(projectLink)}
                        style={{
                          background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-play-circle me-2"></i>
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
    </div>
  );
}

export default MyProjects;