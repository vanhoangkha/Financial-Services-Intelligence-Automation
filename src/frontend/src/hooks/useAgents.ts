/**
 * useAgents - Agent Management Hook
 *
 * Specialized hook for managing agents with CRUD operations.
 * Handles fetching, creating, updating, deleting, and selecting agents.
 *
 * @example
 * const {
 *   agents,
 *   selectedAgent,
 *   loading,
 *   error,
 *   createAgent,
 *   updateAgent,
 *   deleteAgent
 * } = useAgents();
 */

import { useState, useCallback, useEffect } from 'react';
import agentAPI from '../services/api/agents';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  [key: string]: any;
}

interface UseAgentsReturn {
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (agentData: any) => Promise<any>;
  updateAgent: (id: string, agentData: any) => Promise<any>;
  deleteAgent: (id: string) => Promise<void>;
  selectAgent: (id: string) => void;
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await agentAPI.getAgents();

      if (response.status === 'success' && response.data) {
        setAgents(response.data);
      } else {
        setError(response.message || 'Failed to fetch agents');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAgent = useCallback(async (agentData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await agentAPI.createAgent(agentData);

      if (response.status === 'success') {
        await fetchAgents(); // Refresh list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create agent');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAgents]);

  const updateAgent = useCallback(async (id: string, agentData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await agentAPI.updateAgent(id, agentData);

      if (response.status === 'success') {
        await fetchAgents(); // Refresh list
        return response;
      } else {
        throw new Error(response.message || 'Failed to update agent');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAgents]);

  const deleteAgent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await agentAPI.deleteAgent(id);
      await fetchAgents(); // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAgents]);

  const selectAgent = useCallback((id: string) => {
    const agent = agents.find(a => a.id === id);
    setSelectedAgent(agent || null);
  }, [agents]);

  // Auto-fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    selectedAgent,
    loading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    selectAgent
  };
}

export default useAgents;
