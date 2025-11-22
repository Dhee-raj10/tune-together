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
  const [requests, setRequests] = useState([]);
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
      const response = await api.get('/collaboration/requests/received');
      
      console.log('✅ Requests received:', response.data);
      setRequests(response.data || []);
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

      setRequests(prev => prev.filter(req => req._id !== requestId));

      toast({
        title: "Success!", 
        description: "Collaboration accepted! Redirecting to workspace...", 
        variant: 'success'
      });

      setTimeout(() => {
        navigate(
          response.data.projectId 
            ? `/collaboration-workspace/${response.data.projectId}`
            : '/my-projects'
        );
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
      setRequests(prev => prev.filter(req => req._id !== requestId));

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container text-center my-5">
          <h3>Loading...</h3>
          <p>Loading your requests...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-5">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>Collaboration Requests</h2>
            <p className="text-muted">Manage incoming collaboration invitations</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/find-collaborators')}>
            Find Collaborators
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center p-5 bg-light rounded">
            <h4>No pending requests</h4>
            <p>When someone sends you a collaboration request, it will appear here.</p>
            <button className="btn btn-primary" onClick={() => navigate('/find-collaborators')}>
              Find Musicians to Collaborate
            </button>
          </div>
        ) : (
          <>
            <p>You have {requests.length} pending request{requests.length !== 1 ? 's' : ''}</p>

            {requests.map(request => (
              <div key={request._id} className="card mb-3 p-3">
                <div className="d-flex align-items-center">
                  <img
                    src={request.senderId?.avatar_url || 'https://via.placeholder.com/60'}
                    className="rounded-circle me-3"
                    alt="User Avatar"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #e9ecef' }}
                  />

                  <div className="flex-grow-1">
                    <h5>{request.senderId?.username || 'Unknown User'} wants to collaborate</h5>
                    <p><strong>Project:</strong> {request.projectName || 'Untitled Project'}</p>

                    {request.lookingForInstrument && <p><strong>Looking for:</strong> {request.lookingForInstrument}</p>}
                    {request.projectDescription && <p><strong>Project Goal:</strong> {request.projectDescription}</p>}
                    {request.message && <p><strong>Personal Message:</strong> "{request.message}"</p>}

                    <small className="text-muted">
                      Received {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                    </small>
                  </div>

                  <div className="ms-3">
                    <button className="btn btn-outline-danger me-2" onClick={() => handleReject(request._id)}>
                      Decline
                    </button>
                    <button className="btn btn-success" onClick={() => handleAccept(request._id)}>
                      Accept & Start Collaborating
                    </button>
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
