/**
 * TasksTab Component
 *
 * Container for task management and history.
 * Displays task assignments table and statistics.
 */

import React from 'react';
import { SpaceBetween, Container, Header, Box, ColumnLayout } from '@cloudscape-design/components';
import { TaskAssignment, Agent } from '../../../types/agent.types';
import { TaskTable } from './TaskTable';

interface TasksTabProps {
  tasks: TaskAssignment[];
  agents: Agent[];
}

export const TasksTab: React.FC<TasksTabProps> = ({ tasks, agents }) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const runningTasks = tasks.filter(t => t.status === 'running').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;

  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Task Statistics</Header>}>
        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Total Tasks</Box>
            <Box variant="h1" fontSize="display-l" fontWeight="heavy">
              {tasks.length}
            </Box>
          </div>

          <div>
            <Box variant="awsui-key-label">Running</Box>
            <Box variant="h1" fontSize="display-l" fontWeight="heavy" color="text-status-info">
              {runningTasks}
            </Box>
          </div>

          <div>
            <Box variant="awsui-key-label">Completed</Box>
            <Box variant="h1" fontSize="display-l" fontWeight="heavy" color="text-status-success">
              {completedTasks}
            </Box>
          </div>

          <div>
            <Box variant="awsui-key-label">Pending</Box>
            <Box variant="h1" fontSize="display-l" fontWeight="heavy" color="text-status-warning">
              {pendingTasks}
            </Box>
          </div>
        </ColumnLayout>
      </Container>

      <Container header={<Header variant="h2">Task History</Header>}>
        <TaskTable tasks={tasks} agents={agents} />
      </Container>
    </SpaceBetween>
  );
};

export default TasksTab;
