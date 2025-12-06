// src/pages/UserProfilePage.js - COMPLETE REPLACEMENT
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { UserProfile } from '../components/UserProfile';

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutError, setLogoutError] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  const loadUserProjects = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('📥 Loading projects for user:', user.id || user._id);
      
      // Get all projects
      const res = await api.get('/projects');
      console.log('✅ Projects loaded:', res.data.length);
      
      setProjects(res.data || []);
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      
      if (error.response?.status === 401) {
        console.log('Token expired, redirecting to login');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user, loadUserProjects]);
  
  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setLogoutError('Error logging out. Please try again.');
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      
      <Container className="py-5 flex-grow-1">
        <Row>
          <Col>
            {logoutError && (
              <Alert variant="danger" dismissible onClose={() => setLogoutError(null)}>
                {logoutError}
              </Alert>
            )}
            
            <UserProfile userId={user.id || user._id} />
            
            {/* Removed Projects Section - Profile is for editing only */}
            
            <Card className="mt-4">
              <Card.Body className="text-center">
                <h5>Need to manage your projects?</h5>
                <p className="text-muted">View and manage all your projects in the dedicated projects page</p>
                <Link to="/my-projects" className="btn btn-primary me-2">
                  <i className="bi bi-folder me-2"></i>
                  Go to My Projects
                </Link>
                <Link to="/explore" className="btn btn-outline-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Project
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;