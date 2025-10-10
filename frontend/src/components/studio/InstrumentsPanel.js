import React from "react";

export const InstrumentsPanel = () => {
  return (
    <div className="col-lg-3 border rounded-3 p-4 bg-light">
      <h2 className="h5 fw-bold mb-4">Instruments</h2>
      <div className="d-grid gap-2">
        <button className="btn btn-outline-secondary text-start">
          <span role="img" aria-label="drum">🥁</span> Drum Machine
        </button>
        <button className="btn btn-outline-secondary text-start">
          <span role="img" aria-label="piano">🎹</span> Piano
        </button>
        <button className="btn btn-outline-secondary text-start">
          <span role="img" aria-label="guitar">🎸</span> Guitar
        </button>
        <button className="btn btn-outline-secondary text-start">
          <span role="img" aria-label="synth">🎺</span> Synth
        </button>
      </div>
    </div>
  );
};
