import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Alert, Row, Col, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { TrackUploader } from '../components/TrackUploader';
import { AISuggestionPanel } from '../components/studio/AISuggestionPanel';
import { toast } from '../hooks/use-toast'; 

const SoloProjectFlow = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { createProject } = useProjects();
    
    // Flow State: 0: Initial Details, 1: Upload Track, 2: AI Suggestion, 3: Complete
    const [step, setStep] = useState(0); 
    const [projectId, setProjectId] = useState(null);
    const [originalTrack, setOriginalTrack] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Step 0: Initial Details Submission
    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        if (!user || isCreating) return;
        setIsCreating(true);

        try {
            const projectData = {
                title: projectName,
                description: projectDesc,
                mode: 'solo',
                owner_id: user.id,
            };
            const newProject = await createProject(projectData);
            if (newProject && newProject.id) {
                setProjectId(newProject.id);
                setStep(1); // Move to Upload step
            }
        } catch (error) {
             toast({ title: 'Failed to start project.', variant: 'error' });
        } finally {
            setIsCreating(false);
        }
    };

    // Step 1: Track Upload Completion - The TrackUploader passes back the new track data
    const handleUploadComplete = (newTrack) => {
        setOriginalTrack(newTrack);
        toast({ title: 'Main track uploaded successfully!', variant: 'success' });
        setStep(2); // Move to AI Suggestion step
    };

    // Step 2: AI Suggestion Accepted - This means the AI-generated track is saved
    const handleSuggestionAccepted = () => {
        // The AISuggestionPanel handles saving the new track to the project via its internal logic.
        toast({ title: 'AI track successfully merged and added!', variant: 'success' });
        setStep(3);
    };

    // Step 3: Final Navigation
    const handleFinalize = () => {
        navigate(`/studio/${projectId}`);
    };

    // --- Render Functions ---

    const renderDetailsForm = () => (
        <Card className="p-4 shadow">
            <h3 className="h5 fw-bold mb-4">Step 1: Project Details</h3>
            <Form onSubmit={handleInitialSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Project Title</Form.Label>
                    <Form.Control type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Description (Optional)</Form.Label>
                    <Form.Control as="textarea" rows={3} value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Next: Upload Track'}
                </Button>
            </Form>
        </Card>
    );

    const renderUploader = () => (
        <Card className="p-4 shadow">
            <h3 className="h5 fw-bold mb-4">Step 2: Upload Your Main Track</h3>
            <TrackUploader projectId={projectId} onUploadComplete={handleUploadComplete} />
            <Button variant="link" onClick={() => setStep(0)}>Back to Details</Button>
        </Card>
    );

    const renderAISuggestion = () => (
        <Row className='g-4'>
            <Col md={7}>
                <Card className="p-4 shadow h-100">
                    <h3 className="h5 fw-bold mb-3">Track Info: {originalTrack.title}</h3>
                    <p>The AI will use the harmony, tempo, and style of your uploaded track as a **compatibility factor** to generate a new layer. This layer will be **merged into your project** upon acceptance.</p>
                    <Alert variant="info" className="mt-3">
                        **Project ID:** {projectId}
                    </Alert>
                </Card>
            </Col>
            <Col md={5}>
                <AISuggestionPanel 
                    projectId={projectId} 
                    onSuggestionAccepted={handleSuggestionAccepted} 
                    originalTrack={originalTrack} 
                />
            </Col>
        </Row>
    );

    return (
        <Container className="py-5">
            <h1 className="display-6 fw-bold mb-5 text-center">Start Solo Project Flow</h1>
            {step === 0 && renderDetailsForm()}
            {step === 1 && renderUploader()}
            {step === 2 && renderAISuggestion()}
            {step === 3 && (
                <Alert variant="success" className="text-center p-5">
                    <h4 className="alert-heading">Setup Complete!</h4>
                    <p>Your project, **{projectName}**, now includes your original track and the AI-generated layer. You can start mixing in the Studio.</p>
                    <Button onClick={handleFinalize} variant="success" className='mt-3'>Go to Studio</Button>
                </Alert>
            )}
        </Container>
    );
};

export default SoloProjectFlow;
