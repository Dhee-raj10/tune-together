// src/components/studio/StudioLayout.js - FIXED VERSION
import { Link } from "react-router-dom";
import { Navbar } from "../Navbar";
import { DeleteProjectButton } from "./DeleteProjectButton";

export const StudioLayout = ({
  children,
  title,
  mode,
  onDelete,
  isDeleting,
  onRequestSaveAndExit, // ✅ Keep this name
  isRequestingExit,
  canExitImmediately
}) => {
  const getSaveButtonText = () => {
    if (canExitImmediately) return "Save & Exit";
    if (isRequestingExit) return "Request Pending...";
    return "Request Save & Exit";
  };

  // ✅ ADD: Debug handler
  const handleExitClick = () => {
    console.log('🔘 StudioLayout: Exit button clicked');
    console.log('   onRequestSaveAndExit:', typeof onRequestSaveAndExit);
    
    if (typeof onRequestSaveAndExit === 'function') {
      console.log('   ✅ Calling onRequestSaveAndExit...');
      onRequestSaveAndExit();
    } else {
      console.error('   ❌ onRequestSaveAndExit is not a function!');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <div className="container py-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="btn btn-outline-secondary btn-icon-only">
                <i className="bi bi-arrow-left"></i>
              </Link>
              <h1 className="h4 fw-bold mb-0">{title}</h1>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="small text-muted">
                {mode} mode
              </span>
              
              {/* ✅ FIXED: Button with debug handler */}
              <button
                onClick={handleExitClick}
                disabled={!canExitImmediately && isRequestingExit}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                {isRequestingExit ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <i className="bi bi-save"></i>
                )}
                {getSaveButtonText()}
              </button>
              
              {onDelete && (
                <DeleteProjectButton onDelete={onDelete} isDeleting={isDeleting} />
              )}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};