import { useState } from 'react';
import api from '../services/api';
import { toast } from './use-toast'; 

export const useProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const createProject = async (projectData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/projects', projectData);
      toast({ title: 'Project created successfully!', variant: 'success' }); 
      return res.data;
    } catch (error) {
      console.error('Error in createProject:', error);
      const errorMessage = error.response?.data?.msg || 'An unexpected error occurred while creating the project';
      toast({ title: errorMessage, variant: 'error' }); 
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectSettings = async (projectId, settingsData) => {
    setIsLoading(true);
    try {
      await api.put(`/projects/${projectId}`, settingsData);
      toast({ title: 'Project settings saved!', variant: 'success' }); 
      return true;
    } catch (err) {
      console.error('Project settings update error:', err);
      const errorMessage = err.response?.data?.msg || 'An unexpected error occurred while saving settings';
      toast({ title: errorMessage, variant: 'error' }); 
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteProject = async (projectId) => {
    setIsLoading(true);
    try {
      await api.delete(`/projects/${projectId}`); 
      toast({ title: 'Project deleted successfully!', variant: 'success' }); 
      return true;
    } catch (error) {
      console.error('Project deletion error:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to delete project.';
      toast({ title: errorMessage, variant: 'error' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilesByRoles = async (roles) => {
    try {
      const res = await api.get('/profiles', { params: { roles: roles.join(',') } });
      return res.data;
    } catch (error) {
      console.error('Error fetching profiles by roles:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to load musicians';
      toast({ title: errorMessage, variant: 'error' }); 
      return [];
    }
  };

  return {
    isLoading,
    createProject,
    updateProjectSettings,
    deleteProject,
    getProfilesByRoles,
  };
};
