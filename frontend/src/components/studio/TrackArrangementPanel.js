import React from 'react';
import { useStudio } from "../../contexts/StudioContext"; // FIXED: Go up two levels to contexts
import { TrackUploader } from "../TrackUploader"; // FIXED: Go up one level to components

export const TrackArrangementPanel = ({ projectId }) => {
  // Use context to get real-time tracks array
  const { tracks, loadTracks } = useStudio();

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Track List Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Tracks</h3>
        <span className="text-sm text-gray-500">
          {tracks.length} track{tracks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Track Upload Area */}
      <div className="bg-gray-50 rounded-lg p-4">
        <TrackUploader 
          projectId={projectId} 
          onUploadComplete={() => loadTracks && loadTracks(projectId)} 
        />
      </div>

      {/* Tracks Display */}
      <div className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No tracks yet</h4>
            <p className="text-gray-600">Upload audio files to get started with your project.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div key={track.id || track._id || index} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{track.title}</h4>
                      <p className="text-xs text-gray-500">
                        Duration: {Math.round(track.duration || 0)}s
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Track Info */}
      {tracks.length > 0 && (
        <div className="text-xs text-gray-500 border-t pt-3">
          Arrange and play tracks for this project. Use the transport controls to synchronize playback.
        </div>
      )}
    </div>
  );
};