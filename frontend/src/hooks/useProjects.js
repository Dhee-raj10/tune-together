import { useState, useCallback } from 'react';
import api from '../services/api';

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      console.log('✅ Token found:', token.substring(0, 20) + '...');
      console.log('📦 Creating project with data:', projectData);

      // Make the API call (token is automatically added by interceptor)
      const response = await api.post('/projects', projectData);

      console.log('✅ Project created successfully:', response.data);
      return response.data;
      
    } catch (err) {
      console.error('❌ Error in createProject:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/projects/${projectId}`);
      return response.data;
      
    } catch (err) {
      console.error('Error getting project:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/projects');
      return response.data;
      
    } catch (err) {
      console.error('Error getting projects:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.put(`/projects/${projectId}`, updates);
      return response.data;
      
    } catch (err) {
      console.error('Error updating project:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjectSettings = useCallback(async (projectId, settings) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.put(`/projects/${projectId}`, settings);
      console.log('✅ Project settings updated');
      return true;
      
    } catch (err) {
      console.error('Error updating project settings:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message;
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
      
    } catch (err) {
      console.error('Error deleting project:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProject,
    getProject,
    getAllProjects,
    updateProject,
    updateProjectSettings,
    deleteProject,
    loading,
    isLoading: loading,
    error
  };
};