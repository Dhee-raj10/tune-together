// src/App.js - COMPLETE REPLACEMENT
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import MusicStudio from './pages/MusicStudio';
import UserProfilePage from './pages/UserProfilePage';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Learn from './pages/Learn';
import FindCollaborators from './pages/FindCollaborators';
import CollabRequestsPage from './pages/CollaborationRequests';
import MyProjects from './pages/MyProjects';
import LearningModule from './pages/LearningModule';
import SoloProjectFlow from './pages/SoloProjectFlow';
import CollaborationWorkspace from './pages/CollaborationWorkspace';

// NEW PAGES
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Blog from './pages/Blog';
import HelpCenter from './pages/HelpCenter';
import Tutorials from './pages/Tutorials';

import 'bootstrap/dist/css/bootstrap.min.css';
import { StudioProvider } from './contexts/StudioContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StudioProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" richColors />
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Project Routes */}
              <Route path="/create/solo" element={<SoloProjectFlow />} />
              <Route path="/create/:mode" element={<CreateProject />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/music-studio/:id" element={<MusicStudio />} />
              <Route path="/studio/:id" element={<MusicStudio />} />
              
              {/* Profile Routes */}
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/profile/:userId" element={<UserProfilePage />} />
              
              {/* Learning Routes */}
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/module/:moduleId" element={<LearningModule />} />
              <Route path="/tutorials" element={<Tutorials />} />
              
              {/* Collaboration Routes - UNIFIED */}
              <Route path="/find-collaborators" element={<FindCollaborators />} />
              <Route path="/collaborate/find" element={<FindCollaborators />} />
              <Route path="/my-requests" element={<CollabRequestsPage />} />
              <Route path="/requests" element={<CollabRequestsPage />} />
              <Route path="/collaboration-workspace/:projectId" element={<CollaborationWorkspace />} />
              
              {/* Projects */}
              <Route path="/my-projects" element={<MyProjects />} />
              
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/help" element={<HelpCenter />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StudioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;