// src/utils/audioMixer.js - Mix multiple audio files into one

export class AudioMixer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  /**
   * Load an audio file and decode it
   */
  async loadAudioFile(audioUrl) {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  /**
   * Mix two audio buffers into one
   * @param {AudioBuffer} buffer1 - First audio buffer (original track)
   * @param {AudioBuffer} buffer2 - Second audio buffer (AI generated track)
   * @param {number} volume1 - Volume for first track (0-1)
   * @param {number} volume2 - Volume for second track (0-1)
   * @returns {AudioBuffer} - Mixed audio buffer
   */
  mixAudioBuffers(buffer1, buffer2, volume1 = 0.7, volume2 = 0.5) {
    // Determine the longest duration
    const maxLength = Math.max(buffer1.length, buffer2.length);
    const maxDuration = Math.max(buffer1.duration, buffer2.duration);
    const sampleRate = buffer1.sampleRate;
    const numberOfChannels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);

    // Create a new buffer for the mixed audio
    const mixedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      maxLength,
      sampleRate
    );

    // Mix each channel
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const mixedData = mixedBuffer.getChannelData(channel);
      
      // Get channel data from both buffers (or create silent channel if doesn't exist)
      const data1 = channel < buffer1.numberOfChannels 
        ? buffer1.getChannelData(channel) 
        : new Float32Array(buffer1.length);
      
      const data2 = channel < buffer2.numberOfChannels 
        ? buffer2.getChannelData(channel) 
        : new Float32Array(buffer2.length);

      // Mix the samples
      for (let i = 0; i < maxLength; i++) {
        const sample1 = i < data1.length ? data1[i] * volume1 : 0;
        const sample2 = i < data2.length ? data2[i] * volume2 : 0;
        
        // Combine samples (simple addition with clipping prevention)
        let mixed = sample1 + sample2;
        
        // Soft clipping to prevent distortion
        if (mixed > 1.0) mixed = 1.0;
        if (mixed < -1.0) mixed = -1.0;
        
        mixedData[i] = mixed;
      }
    }

    console.log(`Mixed audio: ${maxDuration.toFixed(2)}s, ${numberOfChannels} channels, ${sampleRate}Hz`);
    return mixedBuffer;
  }

  /**
   * Mix multiple audio buffers
   * @param {Array} buffers - Array of {buffer: AudioBuffer, volume: number}
   * @returns {AudioBuffer} - Mixed audio buffer
   */
  mixMultipleBuffers(buffers) {
    if (buffers.length === 0) return null;
    if (buffers.length === 1) return buffers[0].buffer;

    // Start with the first two buffers
    let result = this.mixAudioBuffers(
      buffers[0].buffer,
      buffers[1].buffer,
      buffers[0].volume || 0.7,
      buffers[1].volume || 0.5
    );

    // Mix in remaining buffers one by one
    for (let i = 2; i < buffers.length; i++) {
      result = this.mixAudioBuffers(
        result,
        buffers[i].buffer,
        1.0, // Keep existing mix at full volume
        buffers[i].volume || 0.5
      );
    }

    return result;
  }

  /**
   * Convert AudioBuffer to WAV Blob
   */
  audioBufferToWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    // Interleave channels
    const interleaved = new Float32Array(audioBuffer.length * numChannels);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i++) {
        interleaved[i * numChannels + channel] = channelData[i];
      }
    }
    
    // Convert to 16-bit PCM
    const dataLength = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Mix audio files from URLs and return a WAV Blob
   * @param {Array} audioSources - Array of {url: string, volume: number}
   * @returns {Blob} - Mixed audio as WAV Blob
   */
  async mixAudioFiles(audioSources) {
    console.log('Starting audio mixing...', audioSources);
    
    // Load all audio files
    const buffers = [];
    for (const source of audioSources) {
      console.log(`Loading: ${source.url}`);
      const buffer = await this.loadAudioFile(source.url);
      buffers.push({
        buffer: buffer,
        volume: source.volume || 0.7
      });
    }
    
    console.log(`Loaded ${buffers.length} audio files`);
    
    // Mix all buffers
    const mixedBuffer = this.mixMultipleBuffers(buffers);
    
    // Convert to WAV
    const wavBlob = this.audioBufferToWav(mixedBuffer);
    
    console.log('Mixing complete! WAV size:', (wavBlob.size / 1024 / 1024).toFixed(2), 'MB');
    
    return wavBlob;
  }

  /**
   * Create a downloadable URL from the mixed audio
   */
  createDownloadUrl(blob) {
    return URL.createObjectURL(blob);
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// Helper function to use in components
export async function mixTracksAndUpload(originalTrackUrl, aiTrackUrl, projectId, api, user) {
  const mixer = new AudioMixer();
  
  try {
    // Mix the original track with AI track
    const mixedBlob = await mixer.mixAudioFiles([
      { url: originalTrackUrl, volume: 0.7 },  // Original at 70%
      { url: aiTrackUrl, volume: 0.5 }         // AI at 50%
    ]);
    
    // Create FormData to upload
    const formData = new FormData();
    formData.append('track', mixedBlob, 'mixed-with-ai.wav');
    formData.append('title', 'Mixed Track (Original + AI)');
    formData.append('duration', 0); // Will be calculated by backend
    
    // Upload the mixed track
    const response = await api.post(`/projects/${projectId}/tracks`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${user.token}`
      },
    });
    
    console.log('Mixed track uploaded successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error mixing and uploading tracks:', error);
    throw error;
  } finally {
    mixer.destroy();
  }
}