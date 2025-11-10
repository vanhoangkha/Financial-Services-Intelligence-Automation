/**
 * AgentActivityChart Component
 *
 * Displays agent activity distribution as a pie chart.
 * Shows count of agents by status.
 */

import React from 'react';
import { PieChart, Box } from '@cloudscape-design/components';
import { Agent } from '../../../types/agent.types';

interface AgentActivityChartProps {
  agents: Agent[];
}

export const AgentActivityChart: React.FC<AgentActivityChartProps> = ({ agents }) => {
  // Count agents by status
  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    title: status.toUpperCase(),
    value: count
  }));

  return (
    <Box>
      <PieChart
        data={chartData}
        ariaLabel="Agent activity distribution"
        ariaDescription="Pie chart showing distribution of agents by status"
        detailPopoverContent={(datum) => [
          { key: "Status", value: datum.title },
          { key: "Agents", value: datum.value.toString() },
          { key: "Percentage", value: `${((datum.value / agents.length) * 100).toFixed(1)}%` }
        ]}
        segmentDescription={(datum) =>
          `${datum.value} agents with ${datum.title} status, ${((datum.value / agents.length) * 100).toFixed(1)}%`
        }
        legendTitle="Agent Status"
        hideFilter={false}
        empty={
          <Box textAlign="center" color="inherit">
            <b>No data available</b>
            <Box variant="p" color="inherit">
              There is no data available
            </Box>
          </Box>
        }
        noMatch={
          <Box textAlign="center" color="inherit">
            <b>No matching data</b>
            <Box variant="p" color="inherit">
              There is no matching data to display
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default AgentActivityChart;
