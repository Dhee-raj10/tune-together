// frontend/src/pages/Index.js - PURE BLACK THEME
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { PersonCircle, PeopleFill, BookFill } from "react-bootstrap-icons";

const Index = () => {
  const { user } = useAuth();

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
                <span>TuneTogether</span>
                <span className="d-block mt-2" style={{ color: '#00C6D1' }}>
                  Create, Collaborate, and Learn Music Your Way
                </span>
              </h1>
              <p className="mb-4 lead" style={{ color: '#cccccc' }}>
                Whether you're collaborating with fellow musicians, working on solo projects, or sharpening your skills, TuneTogether is your creative space to make music happen.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                {user ? (
                  <Link to="/create/solo" className="btn btn-lg" style={{
                    background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                    color: '#000000',
                    fontWeight: 'bold',
                    border: 'none',
                    boxShadow: '0 0 20px rgba(0, 198, 209, 0.4)'
                  }}>
                    Start Creating
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-lg" style={{
                      background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                      color: '#000000',
                      fontWeight: 'bold',
                      border: 'none',
                      boxShadow: '0 0 20px rgba(0, 198, 209, 0.4)'
                    }}>
                      Sign Up
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg" style={{
                      borderColor: '#00C6D1',
                      color: '#00C6D1',
                      fontWeight: 'bold'
                    }}>
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 py-md-5" style={{ 
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)' 
        }}>
          <div className="container">
            <div className="mx-auto mb-5 text-center" style={{ maxWidth: '48rem' }}>
              <h2 className="h4 fw-bold" style={{ color: '#ffffff' }}>How It Works</h2>
              <p className="mt-2 lead" style={{ color: '#cccccc' }}>
                Explore our core features and start your musical journey today.
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-4">
                <Card className="text-center h-100 p-4" style={{
                  background: 'rgba(0, 198, 209, 0.1)',
                  border: '2px solid #00C6D1',
                  borderRadius: '15px',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 198, 209, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div className="text-center mb-3">
                    <PersonCircle size={48} style={{ color: '#00C6D1' }} />
                  </div>
                  <Card.Body>
                    <Card.Title style={{ color: '#00C6D1' }}>Solo Projects</Card.Title>
                    <Card.Text style={{ color: '#cccccc' }}>
                      Create private projects to work on your music individually.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="text-center h-100 p-4" style={{
                  background: 'rgba(0, 198, 209, 0.1)',
                  border: '2px solid #00C6D1',
                  borderRadius: '15px',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 198, 209, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div className="text-center mb-3">
                    <PeopleFill size={48} style={{ color: '#00C6D1' }} />
                  </div>
                  <Card.Body>
                    <Card.Title style={{ color: '#00C6D1' }}>Collaboration</Card.Title>
                    <Card.Text style={{ color: '#cccccc' }}>
                      Invite others to work with you and co-create music.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="text-center h-100 p-4" style={{
                  background: 'rgba(0, 198, 209, 0.1)',
                  border: '2px solid #00C6D1',
                  borderRadius: '15px',
                  color: '#ffffff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 198, 209, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div className="text-center mb-3">
                    <BookFill size={48} style={{ color: '#00C6D1' }} />
                  </div>
                  <Card.Body>
                    <Card.Title style={{ color: '#00C6D1' }}>Learning Hub</Card.Title>
                    <Card.Text style={{ color: '#cccccc' }}>
                      Access a library of tutorials and resources to enhance your skills.
                    </Card.Text>
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

export default Index;