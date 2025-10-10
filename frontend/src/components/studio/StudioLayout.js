import { Link } from "react-router-dom";
import { Navbar } from "../Navbar";
import { DeleteProjectButton } from "./DeleteProjectButton";



export const StudioLayout = ({
  children,
  title,
  mode,
  onDelete,
  isDeleting,
  onRequestSaveAndExit,
  isRequestingExit,
  canExitImmediately
}) => {
  const getSaveButtonText = () => {
    if (canExitImmediately) return "Save & Exit";
    if (isRequestingExit) return "Request Pending...";
    return "Request Save & Exit";
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
              <button
                onClick={onRequestSaveAndExit}
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
              <DeleteProjectButton onDelete={onDelete} isDeleting={isDeleting} />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
