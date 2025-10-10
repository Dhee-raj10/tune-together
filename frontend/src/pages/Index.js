import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { PersonCircle, PeopleFill, BookFill } from "react-bootstrap-icons";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {/* Hero Section */}
        <section className="position-relative overflow-hidden py-5 py-md-5">
          <div className="container position-relative z-1">
            <div className="mx-auto text-center" style={{ maxWidth: '48rem' }}>
              <h1 className="mb-4 display-4 fw-bold">
                <span>TuneTogether</span>
                <span className="d-block mt-2">Create, Collaborate, and Learn Music Your Way</span>
              </h1>
              <p className="mb-4 lead text-muted">
                Whether you're collaborating with fellow musicians, working on solo projects, or sharpening your skills, TuneTogether is your creative space to make music happen.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                {user ? (
                  <Link to="/create/solo" className="btn btn-primary btn-lg">
                    Start Creating
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-primary btn-lg">
                      Sign Up
                    </Link>
                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 bg-light py-md-5">
          <div className="container">
            <div className="mx-auto mb-5 text-center" style={{ maxWidth: '48rem' }}>
              <h2 className="h4 fw-bold">How It Works</h2>
              <p className="mt-2 lead text-muted">
                Explore our core features and start your musical journey today.
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-4">
                <Card className="text-center h-100 p-4">
                  <div className="text-center mb-3">
                    <PersonCircle size={48} className="text-primary" />
                  </div>
                  <Card.Body>
                    <Card.Title>Solo Projects</Card.Title>
                    <Card.Text>
                      Create private projects to work on your music individually.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="text-center h-100 p-4">
                  <div className="text-center mb-3">
                    <PeopleFill size={48} className="text-primary" />
                  </div>
                  <Card.Body>
                    <Card.Title>Collaboration</Card.Title>
                    <Card.Text>
                      Invite others to work with you and co-create music.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="text-center h-100 p-4">
                  <div className="text-center mb-3">
                    <BookFill size={48} className="text-primary" />
                  </div>
                  <Card.Body>
                    <Card.Title>Learning Hub</Card.Title>
                    <Card.Text>
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