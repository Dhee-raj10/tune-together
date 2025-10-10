import { useState } from 'react';
import api from '../services/api';


export const useProjectFlow = () => {
  const [flowState, setFlowState] = useState({
    step: 'details',
    projectId: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const createInitialProject = async (title, description, mode) => {
    try {
      setIsProcessing(true);
      const res = await api.post('/projects', { title, description, mode });
      setFlowState({
        step: 'upload',
        projectId: res.data.id
      });
      return res.data.id;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const advanceToIntegration = () => {
    setFlowState(prev => ({ ...prev, step: 'integration' }));
  };

  const completeProjectSetup = () => {
    setFlowState(prev => ({ ...prev, step: 'complete' }));
  };

  return {
    flowState,
    isProcessing,
    createInitialProject,
    advanceToIntegration,
    completeProjectSetup,
  };
};
