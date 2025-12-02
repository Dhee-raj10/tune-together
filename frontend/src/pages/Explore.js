// frontend/src/pages/Explore.js - PURE BLACK THEME
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { PersonCircle, PeopleFill, BookFill } from "react-bootstrap-icons";

const Explore = () => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ 
      background: '#000000',
      color: '#ffffff'
    }}>
      <Navbar />
      <main className="flex-grow-1">
        {/* Hero Section */}
        <section className="position-relative overflow-hidden py-5 py-md-5">
          <div className="container position-relative z-1">
            <div className="mx-auto text-center" style={{ maxWidth: '48rem' }}>
              <h1 className="mb-4 display-4 fw-bold" style={{
                color: '#ffffff',
                textShadow: '0 0 20px rgba(0, 198, 209, 0.5)'
              }}>
                <span>Explore</span>
                <span className="d-block mt-2" style={{ color: '#00C6D1' }}>
                  Choose Your Musical Journey
                </span>
              </h1>
              <p className="mb-4 lead" style={{ color: '#cccccc' }}>
                Select how you want to create and collaborate on your next musical project.
              </p>
            </div>
          </div>
        </section>

        {/* Project Modes Section */}
        <section className="py-5 py-md-5">
          <div className="container">
            <div className="mx-auto mb-5 text-center" style={{ maxWidth: '48rem' }}>
              <h2 className="h4 fw-bold" style={{ color: '#ffffff' }}>Project Modes</h2>
              <p className="mt-2 lead" style={{ color: '#cccccc' }}>
                Choose a mode to start your project. You can change it later if needed.
              </p>
            </div>

            <div className="row g-4 justify-content-center">
              <div className="col-md-4">
                <Card className="text-center p-4 h-100" style={{
                  background: 'rgba(0, 198, 209, 0.1)',
                  border: '2px solid #00C6D1',
                  borderRadius: '15px',
                  color: '#ffffff',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 198, 209, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div className="text-center mb-3">
                    <PersonCircle size={64} style={{ color: '#00C6D1' }} />
                  </div>
                  <Card.Body>
                    <Card.Title style={{ color: '#00C6D1', fontSize: '1.5rem' }}>Solo Mode</Card.Title>
                    <Card.Text style={{ color: '#cccccc' }}>
                      Create and manage your projects by yourself, including AI track suggestions.
                    </Card.Text>
                    <Link to="/create/solo" className="btn mt-3" style={{
                      background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                      color: '#000000',
                      fontWeight: 'bold',
                      border: 'none',
                      width: '100%',
                      padding: '12px'
                    }}>
                      Start Solo Project
                    </Link>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-md-4">
                <Card className="text-center p-4 h-100" style={{
                  background: 'rgba(0, 198, 209, 0.1)',
                  border: '2px solid #00C6D1',
                  borderRadius: '15px',
                  color: '#ffffff',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 198, 209, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div className="text-center mb-3">
                    <PeopleFill size={64} style={{ color: '#00C6D1' }} />
                  </div>
                  <Card.Body>
                    <Card.Title style={{ color: '#00C6D1', fontSize: '1.5rem' }}>Collaboration Mode</Card.Title>
                    <Card.Text style={{ color: '#cccccc' }}>
                      Find collaborators by role and send formal partnership requests.
                    </Card.Text>
                    <Link to="/find-collaborators" className="btn mt-3" style={{
                      background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                      color: '#000000',
                      fontWeight: 'bold',
                      border: 'none',
                      width: '100%',
                      padding: '12px'
                    }}>
                      Find Collaborators
                    </Link>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-md-4">
                <Card className="text-center p-4 h-100" style={{
                  background: 'rgba(0, 198, 209, 0.1)',
                  border: '2px solid #00C6D1',
                  borderRadius: '15px',
                  color: '#ffffff',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 198, 209, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div className="text-center mb-3">
                    <BookFill size={64} style={{ color: '#00C6D1' }} />
                  </div>
                  <Card.Body>
                    <Card.Title style={{ color: '#00C6D1', fontSize: '1.5rem' }}>Learning Mode</Card.Title>
                    <Card.Text style={{ color: '#cccccc' }}>
                      Access educational modules and tutorials to improve your skills.
                    </Card.Text>
                    <Link to="/learn" className="btn mt-3" style={{
                      background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                      color: '#000000',
                      fontWeight: 'bold',
                      border: 'none',
                      width: '100%',
                      padding: '12px'
                    }}>
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