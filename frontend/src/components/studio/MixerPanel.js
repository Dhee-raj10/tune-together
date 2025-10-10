import { useEffect, useState } from "react";
import { useProjects } from "../../hooks/useProjects";
import { useStudio } from "../../contexts/StudioContext"; // Use the new context

export const MixerPanel = ({ projectId, initialMasterVolume, initialTempo }) => {
  const { updateProjectSettings, isLoading } = useProjects();
  const { sendTrackEdit, projectMetadata } = useStudio();
  
  // Use projectMetadata for the current real-time state
  const volumeFromContext = projectMetadata.master_volume ?? initialMasterVolume ?? 0.8;
  const tempoFromContext = projectMetadata.tempo ?? initialTempo ?? 120;
  
  // Local state for input fields
  const [localMasterVolume, setLocalMasterVolume] = useState(volumeFromContext * 100);
  const [localTempo, setLocalTempo] = useState(tempoFromContext);

  useEffect(() => {
    setLocalMasterVolume(volumeFromContext * 100);
  }, [volumeFromContext]);

  useEffect(() => {
    setLocalTempo(tempoFromContext);
  }, [tempoFromContext]);

  // Handler sends real-time change
  const handleTempoChange = (e) => {
    const newTempo = Number(e.target.value);
    setLocalTempo(newTempo);
    
    // CRITICAL: Broadcast change via Socket.IO
    sendTrackEdit(null, { tempo: newTempo }, 'TEMPO'); 
  };

  // Handler sends real-time change
  const handleVolumeChange = (e) => {
    const rawVolume = Number(e.target.value);
    const newVolume = rawVolume / 100;
    setLocalMasterVolume(rawVolume);
    
    // CRITICAL: Broadcast change via Socket.IO
    sendTrackEdit(null, { master_volume: newVolume }, 'MASTER_VOLUME');
  };
  
  // This function now only handles saving the current state to MongoDB
  const handleSaveProject = async () => {
    if (!projectId) {
      alert("Project ID is missing. Cannot save settings.");
      return;
    }
    const success = await updateProjectSettings(projectId, {
      master_volume: localMasterVolume / 100,
      tempo: localTempo,
    });
    // Toast is handled by the hook
  };

  return (
    <div className="card border-0 p-4 bg-light">
      <h2 className="h5 fw-bold mb-4">Mixer</h2>
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="masterVolume" className="form-label">Master Volume ({localMasterVolume}%)</label>
          <input
            id="masterVolume"
            type="range"
            className="form-range"
            min="0"
            max="100"
            value={localMasterVolume}
            onChange={handleVolumeChange} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="tempo" className="form-label">Tempo (BPM)</label>
          <input
            id="tempo"
            type="number"
            className="form-control"
            min="40"
            max="240"
            value={localTempo}
            onChange={handleTempoChange} // Use real-time handler
          />
        </div>
        <button
          onClick={handleSaveProject}
          className="btn btn-primary w-100 mt-4"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Settings (DB)"}
        </button>
      </div>
    </div>
  );
};
