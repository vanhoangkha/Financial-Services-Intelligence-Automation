/**
 * AgentMetricsTab Component
 *
 * Container for agent metrics and performance visualizations.
 * Displays performance charts and activity distribution.
 */

import React from 'react';
import { SpaceBetween, Container, Header, ColumnLayout } from '@cloudscape-design/components';
import { Agent } from '../../../types/agent.types';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import { AgentActivityChart } from './AgentActivityChart';

interface AgentMetricsTabProps {
  agents: Agent[];
}

export const AgentMetricsTab: React.FC<AgentMetricsTabProps> = ({ agents }) => {
  return (
    <SpaceBetween size="l">
      <Container header={<Header variant="h2">Agent Performance</Header>}>
        <AgentPerformanceChart agents={agents} />
      </Container>

      <ColumnLayout columns={2}>
        <Container header={<Header variant="h2">Activity Distribution</Header>}>
          <AgentActivityChart agents={agents} />
        </Container>

        <Container header={<Header variant="h2">Load Summary</Header>}>
          <SpaceBetween size="m">
            {agents.map(agent => (
              <div key={agent.agent_id}>
                <strong>{agent.name}:</strong> {agent.load_percentage}%
              </div>
            ))}
          </SpaceBetween>
        </Container>
      </ColumnLayout>
    </SpaceBetween>
  );
};

export default AgentMetricsTab;
