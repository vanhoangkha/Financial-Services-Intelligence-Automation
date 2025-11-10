/**
 * TaskTable Component
 *
 * Displays a table of task assignments with status, priority, and timing.
 */

import React from 'react';
import { Table, Box, StatusIndicator, Badge } from '@cloudscape-design/components';
import { TaskAssignment, Agent } from '../../../types/agent.types';

interface TaskTableProps {
  tasks: TaskAssignment[];
  agents: Agent[];
  loading?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, agents, loading }) => {
  const getAgentName = (agentId: string): string => {
    const agent = agents.find(a => a.agent_id === agentId);
    return agent ? agent.name : agentId;
  };

  const getPriorityColor = (priority: string): 'red' | 'blue' | 'green' | undefined => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'red';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return undefined;
    }
  };

  const getStatusType = (status: string): 'success' | 'in-progress' | 'pending' | 'error' => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'in-progress';
      case 'pending': return 'pending';
      case 'failed': return 'error';
      default: return 'pending';
    }
  };

  return (
    <Table
      columnDefinitions={[
        {
          id: 'task_id',
          header: 'Task ID',
          cell: (item: TaskAssignment) => (
            <Box variant="code">{item.task_id}</Box>
          ),
          sortingField: 'task_id'
        },
        {
          id: 'agent',
          header: 'Agent',
          cell: (item: TaskAssignment) => (
            <Box variant="strong">{getAgentName(item.agent_id)}</Box>
          )
        },
        {
          id: 'task_type',
          header: 'Task Type',
          cell: (item: TaskAssignment) => item.task_type
        },
        {
          id: 'priority',
          header: 'Priority',
          cell: (item: TaskAssignment) => (
            <Badge color={getPriorityColor(item.priority)}>
              {item.priority.toUpperCase()}
            </Badge>
          )
        },
        {
          id: 'status',
          header: 'Status',
          cell: (item: TaskAssignment) => (
            <StatusIndicator type={getStatusType(item.status)}>
              {item.status.toUpperCase()}
            </StatusIndicator>
          )
        },
        {
          id: 'created_at',
          header: 'Created',
          cell: (item: TaskAssignment) =>
            new Date(item.created_at).toLocaleString('vi-VN')
        },
        {
          id: 'duration',
          header: 'Duration',
          cell: (item: TaskAssignment) => `${item.estimated_duration} min`
        }
      ]}
      items={tasks}
      loading={loading}
      loadingText="Loading tasks..."
      sortingDisabled={false}
      empty={
        <Box textAlign="center" color="inherit">
          <Box variant="strong" textAlign="center" color="inherit">
            No tasks
          </Box>
          <Box variant="p" padding={{ bottom: 's' }} color="inherit">
            No task assignments found.
          </Box>
        </Box>
      }
    />
  );
};

export default TaskTable;
