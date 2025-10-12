// src/pages/CreateProject.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Card, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';

const CreateProject = () => {
  const [searchParams] = useSearchParams(); 
  
  const initialMode = searchParams.get('mode') === 'collaborative' ? 'collaborative' : 'solo';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProjects();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to create a project');
      return;
    }

    setIsLoading(true);
    try {
      const projectData = {
        title,
        description,
        mode, 
        owner_id: user.id,
        tempo: 120,
        master_volume: 0.8
      };

      const newProject = await createProject(projectData);
      
      console.log('Project created:', newProject);
      
      // CRITICAL FIX: Use id OR _id, whichever exists
      const projectId = newProject.id || newProject._id;
      
      if (projectId) {
        console.log('Navigating to music studio with ID:', projectId);
        navigate(`/music-studio/${projectId}`); 
      } else {
        console.error('No project ID returned:', newProject);
        alert('Error: Project created but no ID returned');
      }
    } catch (error) {
      console.error('An unexpected error occurred during submission', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h2>Create New Project</h2>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Project Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project"
                  />
                </Form.Group>
                

                <Form.Group className="mb-3">
                  <Form.Label>Project Mode</Form.Label>
                  <Form.Select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="solo">Solo Project</option>
                    <option value="collaborative">Collaborative Project</option>
                  </Form.Select>
                </Form.Group>
                {mode === 'collaborative' && (
                    <div className="alert alert-info small mt-3">
                        You are creating a **Collaborative Project**. You should use the **Find Collaborators** link from the Explore page for the full flow.
                    </div>
                )}


                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default CreateProject;