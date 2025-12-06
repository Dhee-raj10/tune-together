// src/components/Footer.js - COMPLETE REPLACEMENT
import { Link } from "react-router-dom";
import { MusicNote, Twitter, Instagram, Youtube } from "react-bootstrap-icons";

export function Footer() {
  return (
    <footer className="bg-light border-top mt-5 py-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-3">
            <Link to="/" className="d-flex align-items-center mb-2 text-decoration-none">
              <MusicNote size={24} />
              <span className="fs-5 fw-bold ms-2 text-dark">TuneTogether</span>
            </Link>
            <p className="small text-muted">
              Create, collaborate, and learn music together.
            </p>
          </div>
          
          <div className="col-6 col-md-3">
            <h5 className="h6 fw-semibold mb-2">Platform</h5>
            <ul className="list-unstyled mb-0">
              <li><Link to="/create/solo" className="text-muted text-decoration-none">Solo Mode</Link></li>
              <li><Link to="/find-collaborators" className="text-muted text-decoration-none">Collaboration Mode</Link></li>
              <li><Link to="/learn" className="text-muted text-decoration-none">Learning Mode</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-md-3">
            <h5 className="h6 fw-semibold mb-2">Resources</h5>
            <ul className="list-unstyled mb-0">
              <li><Link to="/blog" className="text-muted text-decoration-none">Blog</Link></li>
              <li><Link to="/tutorials" className="text-muted text-decoration-none">Tutorials</Link></li>
              <li><Link to="/help" className="text-muted text-decoration-none">Help Center</Link></li>
            </ul>
          </div>
          
          <div className="col-6 col-md-3">
            <h5 className="h6 fw-semibold mb-2">Legal</h5>
            <ul className="list-unstyled mb-0">
              <li><Link to="/privacy" className="text-muted text-decoration-none">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted text-decoration-none">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-top pt-3 mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="small text-muted mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} TuneTogether. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <a href="https://twitter.com" className="text-muted" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
            <a href="https://instagram.com" className="text-muted" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
            <a href="https://youtube.com" className="text-muted" target="_blank" rel="noopener noreferrer"><Youtube size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}