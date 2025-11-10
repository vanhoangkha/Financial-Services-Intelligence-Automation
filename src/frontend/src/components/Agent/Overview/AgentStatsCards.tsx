/**
 * AgentStatsCards Component
 *
 * Displays summary statistics for agents in card format.
 * Shows total agents, active agents, and coordination engine status.
 */

import React from 'react';
import { ColumnLayout, Box, StatusIndicator } from '@cloudscape-design/components';
import { AgentStats } from '../../../types/agent.types';

interface AgentStatsCardsProps {
  stats: AgentStats | null;
  loading?: boolean;
}

export const AgentStatsCards: React.FC<AgentStatsCardsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <Box textAlign="center" padding="l">
        <StatusIndicator type="loading">Đang tải thống kê...</StatusIndicator>
      </Box>
    );
  }

  return (
    <ColumnLayout columns={3} variant="text-grid">
      <div>
        <Box variant="awsui-key-label">Tổng số Agents</Box>
        <Box variant="h1" fontSize="display-l" fontWeight="heavy">
          {stats.total_agents}
        </Box>
      </div>

      <div>
        <Box variant="awsui-key-label">Agents đang hoạt động</Box>
        <Box variant="h1" fontSize="display-l" fontWeight="heavy" color="text-status-success">
          {stats.active_agents}
        </Box>
        <Box variant="small">
          <StatusIndicator type="success">
            {((stats.active_agents / stats.total_agents) * 100).toFixed(0)}% hoạt động
          </StatusIndicator>
        </Box>
      </div>

      <div>
        <Box variant="awsui-key-label">Coordination Engine</Box>
        <Box fontSize="heading-m" fontWeight="bold">
          {stats.coordination_engine}
        </Box>
        <Box variant="small">
          <StatusIndicator type="success">Đang hoạt động</StatusIndicator>
        </Box>
      </div>
    </ColumnLayout>
  );
};

export default AgentStatsCards;
