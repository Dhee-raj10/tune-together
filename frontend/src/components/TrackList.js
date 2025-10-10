import { useEffect, useState } from 'react';
import api from '../services/api';
import { TrackPlayer } from './TrackPlayer';

export const TrackList = ({ projectId }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/tracks`);
      setTracks(res.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTracks();
    }
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="h5 fw-semibold">Tracks</h3>
      </div>
      <div className="mt-4">
        {loading ? (
          <p className="text-muted small">Loading tracks...</p>
        ) : tracks.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-3">
            <p className="text-muted small mb-0">No tracks yet.</p>
          </div>
        ) : (
          tracks.map(track => (
            <TrackPlayer
              key={track.id}
              trackUrl={track.file_url}
              title={track.title}
              duration={track.duration}
            />
          ))
        )}
      </div>
    </div>
  );
};
