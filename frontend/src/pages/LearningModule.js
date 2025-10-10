import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';

// Mocked useAuth hook for a self-contained component
const useAuth = () => {
  const user = { id: 'user-123' };
  return { user };
};

// Mocked data service for a self-contained component
const mockDataService = {
  learningModules: {
    '1': {
      id: '1',
      title: 'Introduction to Music Theory',
      description: 'Learn the fundamentals of scales, chords, and rhythm.',
      difficulty_level: 'Beginner',
    },
    '2': {
      id: '2',
      title: 'Advanced Sound Engineering',
      description: 'Explore mixing, mastering, and audio effects.',
      difficulty_level: 'Advanced',
    }
  },

  getLearningModule: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const module = mockDataService.learningModules[id];
        if (module) {
          resolve({ data: module });
        } else {
          resolve({ data: null, error: 'Module not found' });
        }
      }, 500); // Simulate network delay
    });
  },
};

// Home page component to provide navigation
const HomePage = () => (
  <Container className="py-5 text-center">
    <h1 className="mb-4">Learning Hub</h1>
    <p className="lead mb-5">Select a learning module to get started.</p>
    <div className="d-flex justify-content-center gap-3">
      <Button as={Link} to="/modules/1" variant="primary" size="lg">
        Beginner Module
      </Button>
      <Button as={Link} to="/modules/2" variant="outline-primary" size="lg">
        Advanced Module
      </Button>
    </div>
  </Container>
);

const LearningModule = () => {
  const { moduleId } = useParams();
  useAuth(); // The return value is no longer destructured to resolve the ESLint warning.
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadModule = useCallback(async () => {
    try {
      const { data, error } = await mockDataService.getLearningModule(moduleId);
      if (error) {
        setError('Module not found');
        return;
      }
      setModule(data);
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]); // Added 'moduleId' to the dependency array

  useEffect(() => {
    loadModule();
  }, [loadModule]);

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
      </Container>
    );
  }

  if (!module) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Module not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h2>{module.title}</h2>
              <p className="text-muted mb-0">{module.description}</p>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Module Information</h5>
                  <p><strong>Difficulty:</strong> {module.difficulty_level}</p>
                  <p><strong>Category:</strong> Learning Module</p>
                </Col>
                <Col md={6}>
                  <h5>Actions</h5>
                  <Button as={Link} to="/" variant="primary" className="me-2">
                    Back to Home
                  </Button>
                  <Button variant="outline-secondary">
                    Bookmark
                  </Button>
                </Col>
              </Row>
              
              <div className="mt-4">
                <Alert variant="info">
                  <strong>Demo Mode:</strong> This is a frontend-only demo. 
                  Learning content and progress tracking are not available without a backend.
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
      <Route path="/modules/:moduleId" element={<LearningModule />} />
    </Routes>
  </BrowserRouter>
);

export default App;
