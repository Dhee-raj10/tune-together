import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Card, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';

const CreateProject = () => {
  const [searchParams] = useSearchParams();
  const initialMode =
    searchParams.get('mode') === 'collaborative' ? 'collaborative' : 'solo';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Please log in to create a project', variant: 'error' });
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      toast({ title: 'Please enter a project title', variant: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        mode,
        owner_id: user.id || user._id,
        tempo: 120,
        master_volume: 0.8,
      };

      console.log('Creating project:', projectData);

      const response = await api.post('/projects', projectData);
      const newProject = response.data;

      console.log('Project created:', newProject);

      const projectId = newProject.id || newProject._id;

      if (!projectId) {
        throw new Error('No project ID returned');
      }

      toast({ title: 'Project created successfully!', variant: 'success' });

      // Navigate based on mode
      if (mode === 'collaborative') {
        navigate(`/collaboration-workspace/${projectId}`);
      } else {
        navigate(`/music-studio/${projectId}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Failed to create project',
        description: error.response?.data?.msg || error.message,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <Card className="shadow-lg rounded-4">
        <Card.Body>
          <h3 className="text-center mb-3">Create New Project</h3>
          <p className="text-center text-muted mb-4">
            {mode === 'collaborative'
              ? 'Start a collaborative project to work with others'
              : 'Create a solo project for personal music creation'}
          </p>

          <Form onSubmit={handleSubmit}>
            {/* Project Title */}
            <Form.Group className="mb-3" controlId="projectTitle">
              <Form.Label>Project Title *</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3" controlId="projectDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project"
              />
            </Form.Group>

            {/* Project Mode */}
            <Form.Group className="mb-4" controlId="projectMode">
              <Form.Label>Project Mode</Form.Label>
              <Form.Select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="solo">Solo Project</option>
                <option value="collaborative">Collaborative Project</option>
              </Form.Select>
              <Form.Text className="text-muted">
                {mode === 'collaborative'
                  ? 'Real-time collaboration with other musicians'
                  : 'Work independently with AI assistance'}
              </Form.Text>
            </Form.Group>

            {/* Buttons */}
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => navigate('/explore')}>
                Cancel
              </Button>

              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateProject;
