import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function FindCollaborators() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    message: ''
  });

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/musicians/instruments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstruments(response.data.instruments);
    } catch (error) {
      console.error('Error loading instruments:', error);
    }
  };

  const searchMusicians = async () => {
    if (!selectedInstrument) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/musicians/search`, {
        params: { instrument: selectedInstrument },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMusicians(response.data.musicians);
    } catch (error) {
      console.error('Error searching musicians:', error);
      alert('Failed to search musicians');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/collaboration/requests`, {
        receiverId: selectedMusician.id,
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        lookingForInstrument: selectedMusician.instrument,
        message: formData.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Collaboration request sent successfully!');
      setShowModal(false);
      setFormData({ projectName: '', projectDescription: '', message: '' });
      navigate('/collaboration-requests');
    } catch (error) {
      console.error('Error sending request:', error);
      alert(error.response?.data?.error || 'Failed to send request');
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Find Collaborators</h1>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <select
                className="form-select"
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
              >
                <option value="">Select an instrument...</option>
                {instruments.map(inst => (
                  <option key={inst.instrument} value={inst.instrument}>
                    {inst.instrument} ({inst.userCount} musicians)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={searchMusicians}
                disabled={!selectedInstrument || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="row g-4">
        {musicians.map(musician => (
          <div key={musician.id} className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={musician.profilePicture || 'https://via.placeholder.com/50'}
                    alt={musician.username}
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="card-title mb-0">{musician.username}</h5>
                    <small className="text-muted">
                      {musician.instrument} • {musician.skillLevel}
                    </small>
                  </div>
                </div>

                {musician.bio && (
                  <p className="card-text text-muted small">
                    {musician.bio.substring(0, 100)}
                    {musician.bio.length > 100 && '...'}
                  </p>
                )}

                <div className="d-flex justify-content-between text-muted small mb-3">
                  <span>{musician.yearsExperience} years exp.</span>
                  <span>{musician.projectCount} projects</span>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={() => {
                    setSelectedMusician(musician);
                    setShowModal(true);
                  }}
                >
                  <i className="bi bi-send me-2"></i>
                  Send Request
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {musicians.length === 0 && !loading && selectedInstrument && (
        <div className="text-center py-5">
          <i className="bi bi-music-note-beamed" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
          <p className="text-muted mt-3">No musicians found for {selectedInstrument}</p>
        </div>
      )}

      {/* Request Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Send Request to {selectedMusician?.username}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSendRequest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                      placeholder="e.g., Summer Vibes EP"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Project Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
                      placeholder="Describe your project..."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Personal Message</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Why you'd like to collaborate..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Request
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