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
import LearningModule from './pages/LearningModule';
import 'bootstrap/dist/css/bootstrap.min.css';
import { StudioProvider } from './contexts/StudioContext';
// Create a new QueryClient instance
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
            <Route path="/create/:mode" element={<CreateProject />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/music-studio/:id" element={<MusicStudio />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/module/:moduleId" element={<LearningModule />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </StudioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;