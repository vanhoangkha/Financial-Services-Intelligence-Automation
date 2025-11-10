/**
 * AgentPerformanceChart Component
 *
 * Displays agent performance metrics as a bar chart.
 * Shows load percentage for each agent.
 */

import React from 'react';
import { BarChart, Box } from '@cloudscape-design/components';
import { Agent } from '../../../types/agent.types';

interface AgentPerformanceChartProps {
  agents: Agent[];
}

export const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({ agents }) => {
  const chartData = agents.map(agent => ({
    x: agent.name,
    y: agent.load_percentage
  }));

  return (
    <Box>
      <BarChart
        series={[
          {
            title: "Load Percentage",
            type: "bar",
            data: chartData,
            valueFormatter: (value) => `${value}%`
          }
        ]}
        xDomain={agents.map(a => a.name)}
        yDomain={[0, 100]}
        xTitle="Agents"
        yTitle="Load %"
        height={300}
        ariaLabel="Agent performance chart"
        errorText="Error loading chart"
        loadingText="Loading chart"
        recoveryText="Retry"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No agents available</b>
            <Box variant="p" color="inherit">
              There are no agents to display
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default AgentPerformanceChart;
