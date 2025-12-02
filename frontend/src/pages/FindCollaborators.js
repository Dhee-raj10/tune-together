// frontend/src/pages/FindCollaborators.js - CYAN THEME
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const INSTRUMENTS_LIST = [
  { name: 'Piano', icon: '🎹' },
  { name: 'Guitar', icon: '🎸' },
  { name: 'Drums', icon: '🥁' },
  { name: 'Bass', icon: '🎸' },
  { name: 'Violin', icon: '🎻' },
  { name: 'Saxophone', icon: '🎷' },
  { name: 'Trumpet', icon: '🎺' },
  { name: 'Flute', icon: '🎶' },
  { name: 'Vocals', icon: '🎤' },
  { name: 'Synthesizer', icon: '🎹' },
  { name: 'Cello', icon: '🎻' },
  { name: 'Clarinet', icon: '🎶' },
];

function FindCollaborators() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState(null);

  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    lookingForInstrument: '',
    message: ''
  });

  useEffect(() => {
    if (!user) {
      toast({ title: 'Please login to find collaborators', variant: 'error' });
      navigate('/login');
    }
  }, [user, navigate]);

  const searchMusicians = async () => {
    if (!selectedInstrument) {
      toast({ title: 'Please select an instrument', variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const params = { instrument: selectedInstrument };
      if (selectedSkillLevel) params.skillLevel = selectedSkillLevel;

      const response = await api.get('/musicians/search', { params });
      const results = response.data.musicians || [];

      setMusicians(results);

      if (results.length === 0) {
        toast({
          title: 'No musicians found',
          description: `No musicians playing ${selectedInstrument} found.`,
          variant: 'default'
        });
      }
    } catch (err) {
      console.error('❌ Search Error:', err);
      toast({
        title: 'Search failed',
        description: err.response?.data?.error || err.message,
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!formData.projectName.trim()) {
      toast({ title: 'Enter project name', variant: 'error' });
      return;
    }

    try {
      const requestData = {
        receiverId: selectedMusician.id,
        projectName: formData.projectName.trim(),
        projectDescription: formData.projectDescription.trim(),
        lookingForInstrument: selectedMusician.instrument,
        message: formData.message.trim()
      };

      await api.post('/collaboration/requests', requestData);

      toast({
        title: 'Request sent!',
        description: `Request sent to ${selectedMusician.username}`,
        variant: 'success'
      });

      setShowModal(false);
      setFormData({ projectName: '', projectDescription: '', lookingForInstrument: '', message: '' });

      setTimeout(() => navigate('/my-projects'), 1500);
    } catch (error) {
      console.error('❌ Send Request Error:', error);
      toast({
        title: 'Request failed',
        description: error.response?.data?.msg || error.message,
        variant: 'error'
      });
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{
      background: 'rgba(0, 198, 209, 0.08)',
      minHeight: '100vh'
    }}>
      <Navbar />

      <main className="flex-grow-1">
        <div className="container py-5">

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-2" style={{ color: '#00C6D1' }}>
                <i className="bi bi-people me-2" />Find Collaborators
              </h1>
              <p className="lead mb-0" style={{ color: '#0099A8' }}>
                Search musicians & collaborate
              </p>
            </div>
            <button 
              className="btn" 
              onClick={() => navigate('/profile')}
              style={{
                background: 'rgba(0, 198, 209, 0.2)',
                border: '2px solid #00C6D1',
                color: '#00C6D1',
                fontWeight: 'bold'
              }}
            >
              <i className="bi bi-person-plus me-2" />My Profile
            </button>
          </div>

          {/* Info */}
          <div className="alert mb-4" style={{
            background: 'rgba(0, 198, 209, 0.15)',
            border: '2px solid #00C6D1',
            color: '#00C6D1'
          }}>
            <i className="bi bi-info-circle me-2" />
            Add instruments in your profile so others can find you!
          </div>

          {/* Filters */}
          <div className="card mb-4" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid rgba(0, 198, 209, 0.3)',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0, 198, 209, 0.2)'
          }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ color: '#00C6D1' }}>
                <i className="bi bi-funnel me-2" />Search Filters
              </h5>

              <div className="row g-3">
                
                <div className="col-md-5">
                  <label className="form-label fw-semibold" style={{ color: '#00C6D1' }}>
                    Instrument *
                  </label>
                  <select
                    className="form-select"
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    style={{
                      border: '2px solid rgba(0, 198, 209, 0.3)',
                      color: '#0099A8'
                    }}
                  >
                    <option value="">Select an instrument...</option>
                    {INSTRUMENTS_LIST.map(inst => (
                      <option key={inst.name} value={inst.name}>
                        {inst.icon} {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ color: '#00C6D1' }}>
                    Skill Level
                  </label>
                  <select
                    className="form-select"
                    value={selectedSkillLevel}
                    onChange={(e) => setSelectedSkillLevel(e.target.value)}
                    style={{
                      border: '2px solid rgba(0, 198, 209, 0.3)',
                      color: '#0099A8'
                    }}
                  >
                    <option value="">Any level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn w-100"
                    onClick={searchMusicians}
                    disabled={!selectedInstrument || loading}
                    style={{
                      background: loading ? 'rgba(0, 198, 209, 0.5)' : 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2" />
                        Search
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Results */}
          {musicians.length > 0 && (
            <>
              <h5 className="mb-3" style={{ color: '#00C6D1' }}>
                <i className="bi bi-person-check me-2" />
                Found {musicians.length} musician{musicians.length > 1 && 's'}
              </h5>

              <div className="row g-4">
                {musicians.map(musician => (
                  <div key={musician.id} className="col-md-6 col-lg-4">
                    <div className="card h-100" style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid rgba(0, 198, 209, 0.3)',
                      borderRadius: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 198, 209, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div className="card-body">

                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={musician.profilePicture || 'https://via.placeholder.com/60'}
                            alt={musician.username}
                            className="rounded-circle me-3"
                            style={{ 
                              width: 60, 
                              height: 60, 
                              objectFit: 'cover', 
                              border: '3px solid #00C6D1' 
                            }}
                          />
                          <div>
                            <h5 className="mb-0" style={{ color: '#00C6D1' }}>
                              {musician.username}
                            </h5>
                            <small style={{ color: '#0099A8' }}>
                              <i className="bi bi-music-note me-1" />
                              {musician.instrument}
                            </small>
                          </div>
                        </div>

                        {musician.bio && (
                          <p className="text-muted small">
                            {musician.bio.slice(0, 100)}{musician.bio.length > 100 && '...'}
                          </p>
                        )}

                        <div className="mb-3">
                          <span className="badge me-2" style={{
                            background: 'rgba(0, 198, 209, 0.2)',
                            color: '#00C6D1',
                            border: '1px solid #00C6D1'
                          }}>
                            {musician.skillLevel}
                          </span>
                          <small style={{ color: '#0099A8' }}>
                            <i className="bi bi-clock-history me-1" />
                            {musician.yearsExperience} {musician.yearsExperience === 1 ? 'year' : 'years'}
                          </small>
                        </div>

                        <div className="text-muted small mb-3">
                          <i className="bi bi-folder me-1" />
                          {musician.projectCount} {musician.projectCount === 1 ? 'project' : 'projects'}
                        </div>

                        <button
                          className="btn w-100"
                          onClick={() => {
                            setSelectedMusician(musician);
                            setFormData(prev => ({
                              ...prev,
                              lookingForInstrument: musician.instrument
                            }));
                            setShowModal(true);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 'bold'
                          }}
                        >
                          <i className="bi bi-send me-2" />
                          Send Request
                        </button>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />

      {/* Request Modal */}
      {showModal && selectedMusician && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{
              background: 'rgba(0, 198, 209, 0.15)',
              border: '2px solid #00C6D1'
            }}>

              <div className="modal-header" style={{
                background: 'rgba(0, 198, 209, 0.3)',
                borderBottom: '2px solid #00C6D1'
              }}>
                <h5 className="modal-title" style={{ color: '#00C6D1' }}>
                  <i className="bi bi-send me-2" />Send Collaboration Request
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSendRequest}>
                <div className="modal-body">
                  <div className="alert mb-3" style={{
                    background: 'rgba(0, 198, 209, 0.2)',
                    border: '1px solid #00C6D1',
                    color: '#00C6D1'
                  }}>
                    Sending request to <strong>{selectedMusician.username}</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#00C6D1' }}>
                      Project Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="e.g., Summer Vibes EP"
                      style={{ border: '2px solid rgba(0, 198, 209, 0.3)' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#00C6D1' }}>
                      Project Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder="Describe your project..."
                      style={{ border: '2px solid rgba(0, 198, 209, 0.3)' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#00C6D1' }}>
                      Personal Message
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Why collaborate with them?"
                      style={{ border: '2px solid rgba(0, 198, 209, 0.3)' }}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn" 
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#00C6D1',
                      border: '1px solid #00C6D1'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn"
                    style={{
                      background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    <i className="bi bi-send me-2" />Send Request
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindCollaborators;