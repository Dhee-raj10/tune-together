import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const CollaborationRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const { data: requestsData, error: requestsError } = await supabase
          .from('collaboration_requests')
          .select(`
            *,
            projects ( id, title ),
            sender:from_user_id ( id, username, full_name, avatar_url )
          `)
          .eq('to_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        setRequests(requestsData || []);
      } catch (error) {
        console.error("Error fetching collaboration requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    const channel = supabase
      .channel('collaboration-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_requests',
          filter: `to_user_id=eq.${user.id}`
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAction = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('collaboration_requests')
        .update({ status: status })
        .eq('id', requestId);

      if (error) throw error;
      setRequests(requests.filter(req => req.id !== requestId));
      alert(`Request ${status} successfully.`);
    } catch (error) {
      console.error(`Error ${status} collaboration request:`, error);
      alert(`Failed to ${status} request.`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-5 bg-light rounded-3">
        <p className="text-muted small mb-0">No pending collaboration requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map(request => (
        <div key={request.id} className="card shadow-sm border-0 p-3">
          <div className="d-flex align-items-start mb-3">
            <img
              src={request.sender.avatar_url || 'https://placehold.co/40x40'}
              className="rounded-circle me-3"
              alt="User Avatar"
              style={{ width: '40px', height: '40px' }}
            />
            <div>
              <p className="mb-0 fw-semibold">
                {request.sender.username || 'Unknown User'}
              </p>
              <p className="text-sm text-muted mb-0">
                Wants to collaborate on: <span className="fw-semibold text-primary">{request.projects?.title || 'Project Title Missing'}</span>
              </p>
              <p className="text-xs text-muted mb-0">
                Received: {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {request.message && (
            <p className="text-sm mb-3 p-3 bg-light rounded-3 border">
              "{request.message}"
            </p>
          )}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top mt-3">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleAction(request.id, 'rejected')}
            >
              <i className="bi bi-x-lg me-1"></i> Decline
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleAction(request.id, 'accepted')}
            >
              <i className="bi bi-check-lg me-1"></i> Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
