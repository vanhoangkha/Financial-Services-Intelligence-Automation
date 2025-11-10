/**
 * Agent Types
 * Shared type definitions for agent-related components
 */

export interface Agent {
  agent_id: string;
  name: string;
  status: 'active' | 'inactive' | 'busy' | 'error';
  current_task: string | null;
  load_percentage: number;
  last_activity: string;
  capabilities: string[];
  description: string;
}

export interface AgentStats {
  total_agents: number;
  active_agents: number;
  coordination_engine: string;
  agents: Record<string, string>;
}

export interface TaskAssignment {
  task_id: string;
  agent_id: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  estimated_duration: number;
}

export interface TaskForm {
  agent_id: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimated_duration: number;
}

export interface CoordinationForm {
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  agents_required: number;
  description: string;
}

export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
