/**
 * AgentTable Component
 *
 * Displays a table of agents with their status, load, and capabilities.
 * Supports selection and actions.
 */

import React from 'react';
import {
  Table,
  Box,
  StatusIndicator,
  Badge,
  ProgressBar
} from '@cloudscape-design/components';
import { Agent } from '../../../types/agent.types';

interface AgentTableProps {
  agents: Agent[];
  loading?: boolean;
  onSelectAgent?: (agent: Agent) => void;
  getStatusColor: (status: string) => 'success' | 'warning' | 'error' | 'info';
  getLoadColor: (load: number) => 'flash' | undefined;
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  loading,
  onSelectAgent,
  getStatusColor,
  getLoadColor
}) => {
  return (
    <Table
      columnDefinitions={[
        {
          id: 'name',
          header: 'Agent Name',
          cell: (item: Agent) => (
            <div>
              <Box variant="strong">{item.name}</Box>
              <Box variant="small" color="text-status-inactive">
                {item.agent_id}
              </Box>
            </div>
          ),
          sortingField: 'name'
        },
        {
          id: 'status',
          header: 'Trạng thái',
          cell: (item: Agent) => (
            <StatusIndicator type={getStatusColor(item.status)}>
              {item.status.toUpperCase()}
            </StatusIndicator>
          )
        },
        {
          id: 'current_task',
          header: 'Task hiện tại',
          cell: (item: Agent) => item.current_task || <Box color="text-status-inactive">Không có</Box>
        },
        {
          id: 'load',
          header: 'Tải',
          cell: (item: Agent) => (
            <div style={{ width: '120px' }}>
              <ProgressBar
                value={item.load_percentage}
                variant={getLoadColor(item.load_percentage)}
                label={`${item.load_percentage}%`}
              />
            </div>
          )
        },
        {
          id: 'capabilities',
          header: 'Khả năng',
          cell: (item: Agent) => (
            <div>
              {item.capabilities.slice(0, 2).map((cap, idx) => (
                <Badge key={idx} color="blue">{cap}</Badge>
              ))}
              {item.capabilities.length > 2 && (
                <Badge>+{item.capabilities.length - 2}</Badge>
              )}
            </div>
          )
        },
        {
          id: 'last_activity',
          header: 'Hoạt động cuối',
          cell: (item: Agent) => new Date(item.last_activity).toLocaleString('vi-VN')
        }
      ]}
      items={agents}
      loading={loading}
      loadingText="Đang tải agents..."
      empty={
        <Box textAlign="center" color="inherit">
          <Box variant="strong" textAlign="center" color="inherit">
            Không có agents
          </Box>
          <Box variant="p" padding={{ bottom: 's' }} color="inherit">
            Hệ thống chưa có agent nào đăng ký.
          </Box>
        </Box>
      }
      onSelectionChange={({ detail }) => {
        if (detail.selectedItems.length > 0 && onSelectAgent) {
          onSelectAgent(detail.selectedItems[0]);
        }
      }}
      selectionType="single"
    />
  );
};

export default AgentTable;
