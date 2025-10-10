import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { CollaboratorSelector } from '../components/CollaboratorSelector';
import { ProfileList } from '../components/ProfileList';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';

const FindCollaborators = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedCollaborator, setSelectedCollaborator] = useState(null); // Stores the full user object
    const [projectTitle, setProjectTitle] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Action from ProfileList when user clicks 'Collaborate' button
    const handleCollaborateSelection = (profile) => {
        setSelectedCollaborator(profile);
        // Pre-fill the title based on the collaborator
        setProjectTitle(`[Collab] New Project with ${profile.username}`);
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!user || isSending || !selectedCollaborator) return;
        setIsSending(true);

        try {
            // 1. Create the Collaboration Project (mode: 'collaboration')
            const projectData = {
                title: projectTitle,
                description: `Collaboration request sent to ${selectedCollaborator.username}. Message: ${requestMessage.substring(0, 50)}...`,
                mode: 'collaboration',
                owner_id: user.id,
                // Collaborator is NOT added to the project model yet.
            };
            
            const newProjectRes = await api.post('/projects', projectData);
            const newProject = newProjectRes.data;

            // 2. Send the Collaboration Request
            await api.post('/collaboration/requests', {
                project_id: newProject.id,
                to_user_id: selectedCollaborator.id,
                message: requestMessage,
            });

            toast({ title: 'Request Sent!', description: `Awaiting response from ${selectedCollaborator.username}.`, variant: 'success' });
            navigate('/profile'); 

        } catch (error) {
            console.error('Error sending request:', error);
            const errorMsg = error.response?.data?.msg || 'Failed to send collaboration request.';
            toast({ title: errorMsg, variant: 'error' });
        } finally {
            setIsSending(false);
        }
    };
    
    // Render the request form if a collaborator is selected (Step 2)
    const renderRequestForm = () => (
        <Card className="p-4 shadow mt-4 border-success">
            <h3 className="h5 fw-bold mb-4">Send Request to {selectedCollaborator.username}</h3>
            <p className="text-muted small">A new project will be created and a request will be sent for approval.</p>
            <Form onSubmit={handleSendRequest}>
                <Form.Group className="mb-3">
                    <Form.Label>Project Title</Form.Label>
                    <Form.Control type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Brief Message for Collaborator</Form.Label>
                    <Form.Control as="textarea" rows={3} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Describe your project and why you chose this artist." required />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setSelectedCollaborator(null)}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSending}>
                        {isSending ? 'Sending...' : 'Send Request'}
                    </Button>
                </div>
            </Form>
        </Card>
    );

    return (
        <Container className="py-5">
            <h1 className="display-6 fw-bold mb-5 text-center">Find Collaborators</h1>
            
            <Card className="p-4 shadow mb-4">
                <h3 className="h5 fw-bold mb-3">1. Filter by Role</h3>
                <p className="text-muted small">What type of musician are you looking for?</p>
                <CollaboratorSelector onSelectRoles={setSelectedRoles} />
            </Card>
            
            {selectedCollaborator ? (
                renderRequestForm()
            ) : (
                <>
                    <h3 className="h5 fw-bold mb-3">2. Available Artists</h3>
                    <ProfileList selectedRoles={selectedRoles} onCollaborate={handleCollaborateSelection} />
                </>
            )}

        </Container>
    );
};

export default FindCollaborators;
