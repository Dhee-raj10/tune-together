import React, { useRef, useState, useEffect } from 'react';

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${('0' + seconds).slice(-2)}`;
};

export const TrackPlayer = ({ trackUrl, title, duration = 0 }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [audioDuration, setAudioDuration] = useState(duration || 0);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const handleCanPlay = () => setLoadingAudio(false);
    const handleDurationChange = () => {
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        setAudioDuration(audioElement.duration);
      }
    };
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };
    
    audioElement.loop = isLooping;
    audioElement.volume = volume;
    
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isLooping]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = isLooping;
  }, [isLooping]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          alert(`Error playing track: ${error.message}`);
        });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  return (
    <div className="card shadow-sm p-3 mb-3">
      <audio ref={audioRef} src={trackUrl} preload="metadata" />
      <div className="d-flex align-items-center">
        <div className="me-3 d-none d-sm-block">
          {isPlaying ? (
            <button className="btn btn-secondary rounded-circle" onClick={handlePause}>
              <i className="bi bi-pause-fill"></i>
            </button>
          ) : (
            <button className="btn btn-primary rounded-circle" onClick={handlePlay} disabled={loadingAudio}>
              <i className="bi bi-play-fill"></i>
            </button>
          )}
        </div>
        <div className="flex-grow-1 overflow-hidden me-3">
          <p className="mb-0 fw-bold text-truncate">{title}</p>
          <div className="d-flex align-items-center">
            <span className="small text-muted">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="form-range mx-2"
              min="0"
              max={audioDuration}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={loadingAudio}
            />
            <span className="small text-muted">{formatTime(audioDuration)}</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className={`btn btn-light rounded-circle ${isLooping ? 'text-primary' : 'text-muted'}`} onClick={handleToggleLoop}>
            <i className="bi bi-repeat"></i>
          </button>
          <button className="btn btn-light rounded-circle" onClick={handleToggleMute}>
            <i className={`bi ${isMuted ? 'bi-volume-mute' : 'bi-volume-up'}`}></i>
          </button>
          <div className="w-100 d-none d-sm-block" style={{ maxWidth: '100px' }}>
            <input
              type="range"
              className="form-range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
