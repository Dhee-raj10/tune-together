import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CollaborationRequests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (activeTab === 'received') {
        const response = await axios.get(`${API_URL}/api/collaboration/requests/received`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReceivedRequests(response.data.requests);
      } else {
        const response = await axios.get(`${API_URL}/api/collaboration/requests/sent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSentRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/collaboration/requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Request accepted! Redirecting to project...');
      navigate(`/collaboration-workspace/${response.data.project._id}`);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/collaboration/requests/${requestId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Request rejected');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const RequestCard = ({ request, type }) => {
    const otherUser = type === 'received' 
      ? request.senderId 
      : request.receiverId;

    const statusColors = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger'
    };

    return (
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center">
              <img
                src={otherUser?.profilePicture || 'https://via.placeholder.com/50'}
                alt={otherUser?.username}
                className="rounded-circle me-3"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
              <div>
                <h5 className="mb-0">{otherUser?.username}</h5>
                <small className="text-muted">
                  {type === 'received' ? 'wants to collaborate' : 'pending response'}
                </small>
              </div>
            </div>
            <span className={`badge bg-${statusColors[request.status]}`}>
              {request.status}
            </span>
          </div>

          <h6 className="text-primary">{request.projectName}</h6>
          {request.projectDescription && (
            <p className="text-muted small">{request.projectDescription}</p>
          )}

          {request.lookingForInstrument && (
            <p className="mb-2">
              <strong>Looking for:</strong> {request.lookingForInstrument}
            </p>
          )}

          {request.message && (
            <div className="bg-light p-3 rounded mb-3">
              <small className="text-muted">{request.message}</small>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {new Date(request.createdAt).toLocaleDateString()}
            </small>

            {type === 'received' && request.status === 'pending' && (
              <div>
                <button
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => handleReject(request._id)}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Reject
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAccept(request._id)}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Collaboration Requests</h1>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received Requests
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests
          </button>
        </li>
      </ul>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          {activeTab === 'received' ? (
            receivedRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                <p className="text-muted mt-3">No received requests</p>
              </div>
            ) : (
              receivedRequests.map(request => (
                <RequestCard key={request._id} request={request} type="received" />
              ))
            )
          ) : (
            sentRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                <p className="text-muted mt-3">No sent requests</p>
              </div>
            ) : (
              sentRequests.map(request => (
                <RequestCard key={request._id} request={request} type="sent" />
              ))
            )
          )}
        </>
      )}
    </div>
  );
}

export default CollaborationRequests;