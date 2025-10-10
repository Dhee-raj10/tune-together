import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';

// Mocked useAuth hook for a self-contained component
const useAuth = () => {
  const user = {
    id: 'user-123',
    full_name: 'Jane Doe',
    email: 'jane.doe@example.com',
    roles: ['musician', 'songwriter']
  };
  return { user };
};

// Mocked data service for a self-contained component
const mockDataService = {
  projects: {
    '1': {
      id: '1',
      title: 'First Solo Project',
      description: 'A test project to get started with.',
      mode: 'Solo',
      tempo: 120,
      master_volume: 0.8,
      created_at: '2023-01-15T10:00:00Z'
    },
    '2': {
      id: '2',
      title: 'Acoustic Collaboration',
      description: 'Working with friends on a new track.',
      mode: 'Collaborative',
      tempo: 95,
      master_volume: 0.95,
      created_at: '2023-02-20T14:30:00Z'
    }
  },
  tracks: {
    '1': [
      { id: 'track-1', title: 'Acoustic Guitar', duration: 185 },
      { id: 'track-2', title: 'Lead Vocals', duration: 180 },
    ],
    '2': [
      { id: 'track-3', title: 'Bass Line', duration: 210 },
      { id: 'track-4', title: 'Drums', duration: 205 },
      { id: 'track-5', title: 'Piano Chords', duration: 215 },
    ]
  },

  getProject: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const project = mockDataService.projects[id];
        if (project) {
          resolve({ data: project });
        } else {
          resolve({ data: null, error: 'Project not found' });
        }
      }, 500); // Simulate network delay
    });
  },

  getTracks: (projectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tracks = mockDataService.tracks[projectId];
        if (tracks) {
          resolve({ data: tracks });
        } else {
          resolve({ data: [], error: null });
        }
      }, 300); // Simulate network delay
    });
  },
};

// Home page component to provide navigation
const HomePage = () => (
  <Container className="py-5 text-center">
    <h1 className="mb-4">Welcome to Music Projects</h1>
    <p className="lead mb-5">Select a project to view its details.</p>
    <div className="d-flex justify-content-center gap-3">
      <Button as={Link} to="/projects/1" variant="primary" size="lg">
        View Project 1
      </Button>
      <Button as={Link} to="/projects/2" variant="outline-primary" size="lg">
        View Project 2
      </Button>
    </div>
  </Container>
);

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useAuth(); // The 'user' variable is no longer destructured to resolve the ESLint warning.
  const [project, setProject] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProject = useCallback(async () => {
    try {
      const { data: projectData, error: projectError } = await mockDataService.getProject(id);
      if (projectError) {
        setError('Project not found');
        return;
      }

      const { data: tracksData, error: tracksError } = await mockDataService.getTracks(id);
      if (tracksError) {
        setError('Error loading tracks');
        return;
      }

      setProject(projectData);
      setTracks(tracksData || []);
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Project not found</Alert>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h2>{project.title}</h2>
                <p className="text-muted mb-0">{project.description}</p>
              </div>
              <div>
                {/* I am changing the link here to prevent infinite navigation*/}
                <Button
                  as={Link}
                  to="/studio/project.id" //Placeholder since there is no studio page in this code
                  variant="primary"
                  className="me-2"
                >
                  Open Studio
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Project Information</h5>
                  <p><strong>Mode:</strong> {project.mode}</p>
                  <p><strong>Tempo:</strong> {project.tempo} BPM</p>
                  <p><strong>Master Volume:</strong> {Math.round(project.master_volume * 100)}%</p>
                  <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <h5>Tracks ({tracks.length})</h5>
                  {tracks.length === 0 ? (
                    <p className="text-muted">No tracks uploaded yet</p>
                  ) : (
                    <ul className="list-unstyled">
                      {tracks.map(track => (
                        <li key={track.id} className="mb-2">
                          <strong>{track.title}</strong>
                          <br />
                          <small className="text-muted">
                            Duration: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                          </small>
                        </li>
                      ))}
                    </ul>
                  )}
                </Col>
              </Row>
              
              <div className="mt-4">
                <Alert variant="info">
                  <strong>Demo Mode:</strong> This is a frontend-only demo. 
                  Real-time collaboration and track management features are not available without a backend.
                </Alert>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Main App component to define the routes
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
    </Routes>
  </BrowserRouter>
);

export default App;
