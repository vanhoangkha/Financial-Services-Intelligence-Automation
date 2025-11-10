/**
 * useAgentDashboard Hook
 *
 * Centralized state management and API calls for the Agent Dashboard.
 * Handles agents, stats, tasks, and actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { Agent, AgentStats, TaskAssignment, TaskForm, CoordinationForm } from '../types/agent.types';

interface UseAgentDashboardProps {
  onShowSnackbar: (message: string, severity: 'error' | 'success' | 'info' | 'warning') => void;
}

interface UseAgentDashboardReturn {
  // Data
  agents: Agent[];
  agentStats: AgentStats | null;
  tasks: TaskAssignment[];

  // Loading states
  loading: boolean;

  // Actions
  loadAgents: () => Promise<void>;
  loadAgentStats: () => Promise<void>;
  loadTasks: () => void;
  assignTask: (taskForm: TaskForm) => Promise<boolean>;
  coordinate: (coordinationForm: CoordinationForm) => Promise<boolean>;

  // Utilities
  getStatusColor: (status: string) => 'success' | 'warning' | 'error' | 'info';
  getLoadColor: (load: number) => 'flash' | undefined;
}

export function useAgentDashboard({ onShowSnackbar }: UseAgentDashboardProps): UseAgentDashboardReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Load agents from API
  const loadAgents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/mutil_agent/api/v1/agents/list');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      onShowSnackbar('Lỗi khi tải danh sách agents', 'error');
    }
  }, [onShowSnackbar]);

  // Load agent statistics
  const loadAgentStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/mutil_agent/api/v1/agents/health');
      const data = await response.json();
      setAgentStats(data);
    } catch (error) {
      onShowSnackbar('Lỗi khi tải thống kê agents', 'error');
    }
  }, [onShowSnackbar]);

  // Load tasks (mock data for now)
  const loadTasks = useCallback(() => {
    const mockTasks: TaskAssignment[] = [
      {
        task_id: 'task-001',
        agent_id: 'document-intelligence',
        task_type: 'OCR Processing',
        priority: 'high',
        status: 'running',
        created_at: new Date().toISOString(),
        estimated_duration: 45
      },
      {
        task_id: 'task-002',
        agent_id: 'compliance-validation',
        task_type: 'UCP 600 Validation',
        priority: 'medium',
        status: 'completed',
        created_at: new Date(Date.now() - 300000).toISOString(),
        estimated_duration: 30
      }
    ];
    setTasks(mockTasks);
  }, []);

  // Assign task to agent
  const assignTask = useCallback(async (taskForm: TaskForm): Promise<boolean> => {
    if (!taskForm.agent_id || !taskForm.task_type) {
      onShowSnackbar('Vui lòng điền đầy đủ thông tin', 'warning');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/mutil_agent/api/v1/agents/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: taskForm.agent_id,
          task_type: taskForm.task_type,
          priority: taskForm.priority,
          description: taskForm.description,
          estimated_duration: taskForm.estimated_duration
        }),
      });

      if (response.ok) {
        onShowSnackbar('Phân công task thành công', 'success');
        await loadAgents(); // Refresh agent status
        return true;
      } else {
        throw new Error('Task assignment failed');
      }
    } catch (error) {
      onShowSnackbar('Lỗi khi phân công task', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [onShowSnackbar, loadAgents]);

  // Coordinate multi-agent task
  const coordinate = useCallback(async (coordinationForm: CoordinationForm): Promise<boolean> => {
    if (!coordinationForm.task_type) {
      onShowSnackbar('Vui lòng điền đầy đủ thông tin', 'warning');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/mutil_agent/api/v1/agents/coordinate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: coordinationForm.task_type,
          priority: coordinationForm.priority,
          agents_required: coordinationForm.agents_required,
          description: coordinationForm.description
        }),
      });

      if (response.ok) {
        onShowSnackbar('Khởi tạo coordination thành công', 'success');
        await loadAgents();
        return true;
      } else {
        throw new Error('Coordination failed');
      }
    } catch (error) {
      onShowSnackbar('Lỗi khi khởi tạo coordination', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [onShowSnackbar, loadAgents]);

  // Utility: Get status color
  const getStatusColor = useCallback((status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'active': return 'success';
      case 'busy': return 'warning';
      case 'error': return 'error';
      case 'inactive': return 'info';
      default: return 'info';
    }
  }, []);

  // Utility: Get load color
  const getLoadColor = useCallback((load: number): 'flash' | undefined => {
    if (load > 70) return 'flash';
    return undefined;
  }, []);

  // Auto-load data on mount
  useEffect(() => {
    loadAgents();
    loadAgentStats();
    loadTasks();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAgents();
      loadAgentStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAgents, loadAgentStats, loadTasks]);

  return {
    // Data
    agents,
    agentStats,
    tasks,

    // Loading
    loading,

    // Actions
    loadAgents,
    loadAgentStats,
    loadTasks,
    assignTask,
    coordinate,

    // Utilities
    getStatusColor,
    getLoadColor
  };
}

export default useAgentDashboard;
