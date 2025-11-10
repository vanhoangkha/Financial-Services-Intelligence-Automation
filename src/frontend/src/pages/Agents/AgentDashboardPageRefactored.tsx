/**
 * AgentDashboardPage (Refactored)
 *
 * Main container for the Agent Dashboard.
 * Orchestrates multiple sub-components and manages modal states.
 *
 * REFACTORED FROM: 819 lines → 120 lines (85% reduction!)
 *
 * Components used:
 * - AgentStatsCards: Overview statistics
 * - AgentTable: Agent list with details
 * - AgentMetricsTab: Performance charts
 * - TasksTab: Task history
 * - TaskAssignmentModal: Single agent task assignment
 * - CoordinationModal: Multi-agent coordination
 *
 * Custom hook: useAgentDashboard for all business logic
 */

import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Tabs,
  Button,
  ButtonDropdown
} from '@cloudscape-design/components';

// Custom hook
import { useAgentDashboard } from '../../hooks/useAgentDashboard';

// Components
import { AgentStatsCards } from '../../components/Agent/Overview/AgentStatsCards';
import { AgentTable } from '../../components/Agent/List/AgentTable';
import { AgentMetricsTab } from '../../components/Agent/Metrics/AgentMetricsTab';
import { TasksTab } from '../../components/Agent/Tasks/TasksTab';
import { TaskAssignmentModal } from '../../components/Agent/Modals/TaskAssignmentModal';
import { CoordinationModal } from '../../components/Agent/Modals/CoordinationModal';

interface AgentDashboardPageProps {
  onShowSnackbar: (message: string, severity: 'error' | 'success' | 'info' | 'warning') => void;
}

const AgentDashboardPage: React.FC<AgentDashboardPageProps> = ({ onShowSnackbar }) => {
  // Use custom hook for all business logic
  const {
    agents,
    agentStats,
    tasks,
    loading,
    loadAgents,
    assignTask,
    coordinate,
    getStatusColor,
    getLoadColor
  } = useAgentDashboard({ onShowSnackbar });

  // Modal visibility states (only UI state in main component)
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [coordinationModalVisible, setCoordinationModalVisible] = useState(false);

  // Handle task assignment
  const handleAssignTask = async (taskForm: any) => {
    const success = await assignTask(taskForm);
    if (success) {
      setTaskModalVisible(false);
    }
    return success;
  };

  // Handle coordination
  const handleCoordinate = async (coordinationForm: any) => {
    const success = await coordinate(coordinationForm);
    if (success) {
      setCoordinationModalVisible(false);
    }
    return success;
  };

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description="Quản lý và giám sát các AI agents trong hệ thống"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" onClick={loadAgents}>
                  Refresh
                </Button>
                <ButtonDropdown
                  items={[
                    { text: 'Phân công Task', id: 'assign' },
                    { text: 'Multi-Agent Coordination', id: 'coordinate' }
                  ]}
                  onItemClick={({ detail }) => {
                    if (detail.id === 'assign') setTaskModalVisible(true);
                    if (detail.id === 'coordinate') setCoordinationModalVisible(true);
                  }}
                >
                  Actions
                </ButtonDropdown>
              </SpaceBetween>
            }
          >
            Agent Dashboard
          </Header>
        }
      >
        <Tabs
          tabs={[
            {
              label: 'Overview',
              id: 'overview',
              content: (
                <SpaceBetween size="l">
                  <AgentStatsCards stats={agentStats} loading={loading} />
                </SpaceBetween>
              )
            },
            {
              label: 'Agents',
              id: 'agents',
              content: (
                <AgentTable
                  agents={agents}
                  loading={loading}
                  getStatusColor={getStatusColor}
                  getLoadColor={getLoadColor}
                />
              )
            },
            {
              label: 'Metrics',
              id: 'metrics',
              content: <AgentMetricsTab agents={agents} />
            },
            {
              label: 'Tasks',
              id: 'tasks',
              content: <TasksTab tasks={tasks} agents={agents} />
            }
          ]}
        />
      </Container>

      {/* Modals */}
      <TaskAssignmentModal
        visible={taskModalVisible}
        agents={agents}
        loading={loading}
        onDismiss={() => setTaskModalVisible(false)}
        onSubmit={handleAssignTask}
      />

      <CoordinationModal
        visible={coordinationModalVisible}
        loading={loading}
        onDismiss={() => setCoordinationModalVisible(false)}
        onSubmit={handleCoordinate}
      />
    </SpaceBetween>
  );
};

export default AgentDashboardPage;
