// ==========================================
// FILE: src/pages/FindCollaborators.js
// ==========================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

// ✅ Clean instrument names (emojis only for UI, names stored clean)
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
  { name: 'Trombone', icon: '🎺' },
  { name: 'Harp', icon: '🎵' },
  { name: 'Ukulele', icon: '🎸' },
  { name: 'Banjo', icon: '🎸' },
  { name: 'Harmonica', icon: '🎵' },
  { name: 'Accordion', icon: '🎹' }
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

      console.log('🔍 Searching musicians:', params);

      const response = await api.get('/musicians/search', { params });
      const results = response.data.musicians || [];

      setMusicians(results);

      if (results.length === 0) {
        toast({
          title: 'No musicians found',
          description: `No musicians playing ${selectedInstrument} found.`,
          variant: 'default'
        });
      } else {
        toast({
          title: `Found ${results.length} musician(s)`,
          variant: 'success'
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

      console.log('📤 Collaboration request:', requestData);

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
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <div className="container py-5">

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="mb-2"><i className="bi bi-people me-2" />Find Collaborators</h1>
              <p className="lead text-muted mb-0">Search musicians & collaborate</p>
            </div>
            <button className="btn btn-outline-primary" onClick={() => navigate('/profile')}>
              <i className="bi bi-person-plus me-2" />My Profile
            </button>
          </div>

          {/* Info */}
          <div className="alert alert-info mb-4">
            <i className="bi bi-info-circle me-2" />
            Add instruments in your profile so others can find you!
          </div>

          {/* Filters */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-funnel me-2" />Search Filters
              </h5>

              <div className="row g-3">
                
                {/* Instrument */}
                <div className="col-md-5">
                  <label className="form-label fw-semibold">Instrument *</label>
                  <select
                    className="form-select"
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                  >
                    <option value="">Select an instrument...</option>
                    {INSTRUMENTS_LIST.map(inst => (
                      <option key={inst.name} value={inst.name}>
                        {inst.icon} {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill level */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Skill Level</label>
                  <select
                    className="form-select"
                    value={selectedSkillLevel}
                    onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  >
                    <option value="">Any level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                {/* Search Button */}
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={searchMusicians}
                    disabled={!selectedInstrument || loading}
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
              <h5 className="mb-3">
                <i className="bi bi-person-check me-2" />
                Found {musicians.length} musician{musicians.length > 1 && 's'}
              </h5>

              <div className="row g-4">
                {musicians.map(musician => (
                  <div key={musician.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow">
                      <div className="card-body">

                        {/* Profile */}
                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={musician.profilePicture || 'https://via.placeholder.com/60'}
                            alt={musician.username}
                            className="rounded-circle me-3"
                            style={{ width: 60, height: 60, objectFit: 'cover', border: '3px solid #e9ecef' }}
                          />
                          <div>
                            <h5 className="mb-0">{musician.username}</h5>
                            <small className="text-muted">
                              <i className="bi bi-music-note me-1" />
                              {musician.instrument}
                            </small>
                          </div>
                        </div>

                        {/* Bio */}
                        {musician.bio && (
                          <p className="text-muted small">
                            {musician.bio.slice(0, 100)}{musician.bio.length > 100 && '...'}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="mb-3">
                          <span className="badge bg-primary me-2">{musician.skillLevel}</span>
                          <small className="text-muted">
                            <i className="bi bi-clock-history me-1" />
                            {musician.yearsExperience} {musician.yearsExperience === 1 ? 'year' : 'years'}
                          </small>
                        </div>

                        {/* Projects */}
                        <div className="text-muted small mb-3">
                          <i className="bi bi-folder me-1" />
                          {musician.projectCount} {musician.projectCount === 1 ? 'project' : 'projects'}
                        </div>

                        {/* Send Request */}
                        <button
                          className="btn btn-success w-100"
                          onClick={() => {
                            setSelectedMusician(musician);
                            setFormData(prev => ({
                              ...prev,
                              lookingForInstrument: musician.instrument
                            }));
                            setShowModal(true);
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

          {/* Empty states */}
          {!loading && musicians.length === 0 && selectedInstrument && (
            <div className="text-center py-5 bg-light rounded-3">
              <i className="bi bi-music-note-beamed" style={{ fontSize: '4rem', opacity: 0.3 }} />
              <h4 className="mt-3">No musicians found</h4>
              <p className="text-muted">
                No musicians playing <strong>{selectedInstrument}</strong> were found.
              </p>
              <button className="btn btn-outline-primary me-2" onClick={() => setSelectedInstrument('')}>
                <i className="bi bi-arrow-counterclockwise me-2" />
                Try Another Instrument
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                <i className="bi bi-person-plus me-2" />
                Add Instruments
              </button>
            </div>
          )}

          {!selectedInstrument && musicians.length === 0 && (
            <div className="text-center py-5 bg-light rounded-3">
              <i className="bi bi-search" style={{ fontSize: '4rem', opacity: 0.3 }} />
              <h4 className="mt-3">Start Your Search</h4>
              <p className="text-muted">Select an instrument above and click Search</p>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Request Modal */}
      {showModal && selectedMusician && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-send me-2" />Send Collaboration Request</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSendRequest}>
                <div className="modal-body">
                  <div className="alert alert-info mb-3">
                    Sending request to <strong>{selectedMusician.username}</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Project Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="e.g., Summer Vibes EP"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Project Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder="Describe your project..."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Personal Message</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Why collaborate with them?"
                    />
                  </div>

                  <div className="alert alert-warning small">
                    <i className="bi bi-exclamation-triangle me-2" />
                    Once accepted, a shared project will be created.
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-send me-2" />Send Request
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-shadow {
          transition: 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15) !important;
        }
      `}</style>
    </div>
  );
}

export default FindCollaborators;
