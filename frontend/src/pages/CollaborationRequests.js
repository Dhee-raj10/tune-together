// frontend/src/pages/CollaborationRequests.js - COMPLETE REPLACEMENT
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const CollabRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('✅ User logged in:', user.username);
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      console.log('📥 Fetching collaboration requests...');
      
      // Fetch both received and sent requests
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/collaboration/requests/received'),
        api.get('/collaboration/requests/sent')
      ]);
      
      console.log('✅ Received requests:', receivedRes.data.length);
      console.log('✅ Sent requests:', sentRes.data.length);
      
      setReceivedRequests(receivedRes.data || []);
      setSentRequests(sentRes.data || []);
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      
      if (error.response?.status === 401) {
        toast({ title: "Session expired", description: "Please login again", variant: 'error' });
        navigate('/login');
      } else {
        toast({
          title: "Error", 
          description: error.response?.data?.msg || "Failed to fetch requests.", 
          variant: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      console.log('✅ Accepting request:', requestId);
      const response = await api.put(`/collaboration/requests/${requestId}/accept`);

      // Remove from received requests
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));

      toast({
        title: "Success!", 
        description: "Collaboration accepted! Redirecting to workspace...", 
        variant: 'success'
      });

      // Redirect to the newly created project
      setTimeout(() => {
        navigate(`/collaboration-workspace/${response.data.projectId}`);
      }, 1500);

    } catch (error) {
      console.error('❌ Error accepting request:', error);
      toast({
        title: "Error", 
        description: error.response?.data?.msg || 'Failed to accept request.', 
        variant: 'error'
      });
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to decline this collaboration request?')) {
      return;
    }
    
    try {
      console.log('❌ Rejecting request:', requestId);
      await api.put(`/collaboration/requests/${requestId}/reject`);
      
      // Remove from received requests
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));

      toast({ title: "Request declined", variant: 'default' });
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      toast({
        title: "Error", 
        description: error.response?.data?.msg || 'Failed to reject request.', 
        variant: 'error'
      });
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    
    try {
      console.log('🗑️ Cancelling request:', requestId);
      await api.delete(`/collaboration/requests/${requestId}`);
      
      // Remove from sent requests
      setSentRequests(prev => prev.filter(req => req._id !== requestId));

      toast({ title: "Request cancelled", variant: 'default' });
    } catch (error) {
      console.error('❌ Error cancelling request:', error);
      toast({
        title: "Error", 
        description: error.response?.data?.msg || 'Failed to cancel request.', 
        variant: 'error'
      });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="mt-3">Loading requests...</h3>
        </div>
        <Footer />
      </>
    );
  }

  const displayRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <>
      <Navbar />
      <div className="container my-5">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>Collaboration Requests</h2>
            <p className="text-muted">Manage incoming and outgoing collaboration invitations</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/find-collaborators')}>
            <i className="bi bi-search me-2"></i>
            Find Collaborators
          </button>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              <i className="bi bi-inbox me-2"></i>
              Received ({receivedRequests.length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <i className="bi bi-send me-2"></i>
              Sent ({sentRequests.length})
            </button>
          </li>
        </ul>

        {/* Empty State */}
        {displayRequests.length === 0 ? (
          <div className="text-center p-5 bg-light rounded">
            <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#d1d5db' }}></i>
            <h4 className="mt-3">No {activeTab === 'received' ? 'received' : 'sent'} requests</h4>
            <p className="text-muted">
              {activeTab === 'received' 
                ? "When someone sends you a collaboration request, it will appear here."
                : "Requests you send to other musicians will appear here."}
            </p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/find-collaborators')}>
              <i className="bi bi-people me-2"></i>
              Find Musicians to Collaborate
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted mb-4">
              {displayRequests.length} {activeTab === 'received' ? 'pending' : ''} request{displayRequests.length !== 1 ? 's' : ''}
            </p>

            {/* Received Requests */}
            {activeTab === 'received' && receivedRequests.map(request => (
              <div key={request._id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <img
                      src={request.senderId?.avatar_url || 'https://via.placeholder.com/60'}
                      className="rounded-circle me-3"
                      alt="User Avatar"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #e9ecef' }}
                    />

                    <div className="flex-grow-1">
                      <h5 className="mb-2">
                        <strong>{request.senderId?.username || 'Unknown User'}</strong> wants to collaborate
                      </h5>
                      
                      <div className="mb-2">
                        <strong className="text-primary">Project:</strong> {request.projectName || 'Untitled Project'}
                      </div>

                      {request.lookingForInstrument && (
                        <div className="mb-2">
                          <strong>Looking for:</strong> 
                          <span className="badge bg-info ms-2">{request.lookingForInstrument}</span>
                        </div>
                      )}

                      {request.projectDescription && (
                        <div className="mb-2">
                          <strong>Project Description:</strong>
                          <p className="text-muted mb-0">{request.projectDescription}</p>
                        </div>
                      )}

                      {request.message && (
                        <div className="alert alert-light mt-2 mb-2">
                          <strong>Message:</strong>
                          <p className="mb-0 mt-1">"{request.message}"</p>
                        </div>
                      )}

                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Received {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                      </small>
                    </div>

                    <div className="ms-3 d-flex flex-column gap-2">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleAccept(request._id)}
                      >
                        <i className="bi bi-check-lg me-2"></i>
                        Accept & Start
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => handleReject(request._id)}
                      >
                        <i className="bi bi-x-lg me-2"></i>
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Sent Requests */}
            {activeTab === 'sent' && sentRequests.map(request => (
              <div key={request._id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <img
                      src={request.receiverId?.avatar_url || 'https://via.placeholder.com/60'}
                      className="rounded-circle me-3"
                      alt="User Avatar"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #e9ecef' }}
                    />

                    <div className="flex-grow-1">
                      <h5 className="mb-2">
                        Request to <strong>{request.receiverId?.username || 'Unknown User'}</strong>
                      </h5>
                      
                      <div className="mb-2">
                        <strong className="text-primary">Project:</strong> {request.projectName}
                      </div>

                      <div className="mb-2">
                        <span className={`badge ${
                          request.status === 'pending' ? 'bg-warning' :
                          request.status === 'accepted' ? 'bg-success' :
                          'bg-danger'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>

                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Sent {new Date(request.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    {request.status === 'pending' && (
                      <div className="ms-3">
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => handleCancel(request._id)}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CollabRequestsPage;