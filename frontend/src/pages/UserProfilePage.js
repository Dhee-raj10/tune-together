// src/pages/UserProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // FIX: Correctly imported from react-router-dom

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { UserProfile } from '../components/UserProfile';

const UserProfilePage = () => {
  const { user, logout, updateUserRoles } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutError, setLogoutError] = useState(null);
  
  // This function fetches the logged-in user's projects from the backend
  const loadUserProjects = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      // Use the secured route to get user's projects (owned or collaborated)
      const res = await api.get(`/projects/my`); 
      setProjects(res.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserProjects();
  }, [loadUserProjects]);
  
  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
    } catch (error) {
      setLogoutError('Error logging out. Please try again.');
    }
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to view your profile</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <UserProfile userId={user.id} />
          
          <Card className="mt-4">
            <Card.Header>
              <h5>My Projects ({projects.length})</h5>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <p className="text-muted">No projects created yet. <Link to="/explore">Start one now!</Link></p>
              ) : (
                <div className="row">
                  {projects.map(project => (
                    <div key={project._id || project.id} className="col-md-6 mb-3">
                      <Card>
                        <Card.Body>
                          <Card.Title>{project.title}</Card.Title>
                          <Card.Text>{project.description}</Card.Text>
                          <small className="text-muted">
                            Mode: {project.mode} | Created: {new Date(project.created_at).toLocaleDateString()}
                          </small>
                          <div className="mt-2">
                             <Link to={`/studio/${project._id}`} className="btn btn-sm btn-outline-primary">Open Studio</Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage;