// src/App.js
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
import CollabRequestsPage from './pages/CollaborationRequests'; // <-- FIX: Renamed import
import MyProjects from './pages/MyProjects';
import LearningModule from './pages/LearningModule';
import SoloProjectFlow from './pages/SoloProjectFlow';
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
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create/solo" element={<SoloProjectFlow />} />
            <Route path="/create/:mode" element={<CreateProject />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/music-studio/:id" element={<MusicStudio />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/module/:moduleId" element={<LearningModule />} />
            <Route path="/find-collaborators" element={<FindCollaborators />} />
            <Route path="/my-requests" element={<CollabRequestsPage />} />
            <Route path="/requests" element={<CollabRequestsPage />} /> {/* <-- FIX: Used new component name */}
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/music-studio/:id" element={<MusicStudio />} />
            <Route path="/studio/:id" element={<MusicStudio />} />
            <Route path="/collaboration-workspace/:projectId" element={<MusicStudio />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </StudioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;