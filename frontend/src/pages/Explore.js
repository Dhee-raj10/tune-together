// src/pages/Explore.js - COMPLETE REPLACEMENT
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { PersonCircle, PeopleFill, BookFill } from "react-bootstrap-icons";

const Explore = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {/* Hero Section */}
        <section className="position-relative overflow-hidden py-5 py-md-5">
          <div className="container position-relative z-1">
            <div className="mx-auto text-center" style={{ maxWidth: '48rem' }}>
              <h1 className="mb-4 display-4 fw-bold">
                <span>Explore</span>
                <span className="d-block mt-2">Choose Your Musical Journey</span>
              </h1>
              <p className="mb-4 lead text-muted">
                Select how you want to create and collaborate on your next musical project.
              </p>
            </div>
          </div>
        </section>

        {/* Project Modes Section */}
        <section className="py-5 py-md-5">
          <div className="container">
            <div className="mx-auto mb-5 text-center" style={{ maxWidth: '48rem' }}>
              <h2 className="h4 fw-bold">Project Modes</h2>
              <p className="mt-2 lead text-muted">
                Choose a mode to start your project. You can change it later if needed.
              </p>
            </div>

            <div className="row g-4 justify-content-center">
              <div className="col-md-4">
                <Card className="text-center p-4 h-100">
                  <div className="text-center mb-3">
                    <PersonCircle size={48} className="text-primary" />
                  </div>
                  <Card.Body>
                    <Card.Title>Solo Mode</Card.Title>
                    <Card.Text>
                      Create and manage your projects by yourself, including AI track suggestions.
                    </Card.Text>
                    <Link to="/create/solo" className="btn btn-primary mt-3"> 
                      Start Solo Project
                    </Link>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-md-4">
                <Card className="text-center p-4 h-100">
                  <div className="text-center mb-3">
                    <PeopleFill size={48} className="text-primary" />
                  </div>
                  <Card.Body>
                    <Card.Title>Collaboration Mode</Card.Title>
                    <Card.Text>
                      Find collaborators by role and send formal partnership requests.
                    </Card.Text>
                    <Link to="/find-collaborators" className="btn btn-primary mt-3"> 
                      Find Collaborators
                    </Link>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-md-4">
                <Card className="text-center p-4 h-100">
                  <div className="text-center mb-3">
                    <BookFill size={48} className="text-primary" />
                  </div>
                  <Card.Body>
                    <Card.Title>Learning Mode</Card.Title>
                    <Card.Text>
                      Access educational modules and tutorials to improve your skills.
                    </Card.Text>
                    <Link to="/learn" className="btn btn-primary mt-3">
                      Start Learning
                    </Link>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;