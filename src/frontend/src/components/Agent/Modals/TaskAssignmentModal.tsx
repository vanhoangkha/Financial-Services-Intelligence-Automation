/**
 * TaskAssignmentModal Component
 *
 * Modal for assigning tasks to specific agents.
 * Includes form validation and submission handling.
 */

import React, { useState } from 'react';
import {
  Modal,
  Box,
  SpaceBetween,
  Form,
  FormField,
  Input,
  Select,
  Textarea,
  Button
} from '@cloudscape-design/components';
import { Agent, TaskForm, TaskPriority } from '../../../types/agent.types';

interface TaskAssignmentModalProps {
  visible: boolean;
  agents: Agent[];
  loading?: boolean;
  onDismiss: () => void;
  onSubmit: (taskForm: TaskForm) => Promise<boolean>;
}

const PRIORITY_OPTIONS = [
  { label: 'Thấp', value: 'low' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Cao', value: 'high' },
  { label: 'Khẩn cấp', value: 'urgent' }
];

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  visible,
  agents,
  loading,
  onDismiss,
  onSubmit
}) => {
  const [taskForm, setTaskForm] = useState<TaskForm>({
    agent_id: '',
    task_type: '',
    priority: 'medium',
    description: '',
    estimated_duration: 30
  });

  const handleSubmit = async () => {
    const success = await onSubmit(taskForm);
    if (success) {
      // Reset form
      setTaskForm({
        agent_id: '',
        task_type: '',
        priority: 'medium',
        description: '',
        estimated_duration: 30
      });
    }
  };

  const agentOptions = agents.map(agent => ({
    label: agent.name,
    value: agent.agent_id,
    description: `${agent.status} - ${agent.load_percentage}% load`
  }));

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header="Phân công Task cho Agent"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!taskForm.agent_id || !taskForm.task_type}
            >
              Phân công
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <FormField label="Chọn Agent" constraintText="Chọn agent để phân công task">
            <Select
              selectedOption={
                agentOptions.find(opt => opt.value === taskForm.agent_id) || null
              }
              onChange={({ detail }) =>
                setTaskForm({ ...taskForm, agent_id: detail.selectedOption.value || '' })
              }
              options={agentOptions}
              placeholder="Chọn agent..."
              filteringType="auto"
            />
          </FormField>

          <FormField label="Loại Task" constraintText="Mô tả loại công việc cần thực hiện">
            <Input
              value={taskForm.task_type}
              onChange={({ detail }) =>
                setTaskForm({ ...taskForm, task_type: detail.value })
              }
              placeholder="VD: OCR Processing, Compliance Check, Risk Analysis..."
            />
          </FormField>

          <FormField label="Độ ưu tiên">
            <Select
              selectedOption={
                PRIORITY_OPTIONS.find(opt => opt.value === taskForm.priority) || PRIORITY_OPTIONS[1]
              }
              onChange={({ detail }) =>
                setTaskForm({ ...taskForm, priority: detail.selectedOption.value as TaskPriority })
              }
              options={PRIORITY_OPTIONS}
            />
          </FormField>

          <FormField label="Mô tả" constraintText="Chi tiết về task (tùy chọn)">
            <Textarea
              value={taskForm.description}
              onChange={({ detail }) =>
                setTaskForm({ ...taskForm, description: detail.value })
              }
              placeholder="Nhập mô tả chi tiết về task..."
              rows={3}
            />
          </FormField>

          <FormField
            label="Thời gian ước tính (phút)"
            constraintText="Thời gian dự kiến hoàn thành task"
          >
            <Input
              type="number"
              value={String(taskForm.estimated_duration)}
              onChange={({ detail }) =>
                setTaskForm({ ...taskForm, estimated_duration: parseInt(detail.value) || 30 })
              }
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </Modal>
  );
};

export default TaskAssignmentModal;
