/**
 * CoordinationModal Component
 *
 * Modal for initiating multi-agent coordination tasks.
 * Allows specifying task requirements and coordination parameters.
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
import { CoordinationForm, TaskPriority } from '../../../types/agent.types';

interface CoordinationModalProps {
  visible: boolean;
  loading?: boolean;
  onDismiss: () => void;
  onSubmit: (coordinationForm: CoordinationForm) => Promise<boolean>;
}

const PRIORITY_OPTIONS = [
  { label: 'Thấp', value: 'low' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Cao', value: 'high' },
  { label: 'Khẩn cấp', value: 'urgent' }
];

export const CoordinationModal: React.FC<CoordinationModalProps> = ({
  visible,
  loading,
  onDismiss,
  onSubmit
}) => {
  const [coordinationForm, setCoordinationForm] = useState<CoordinationForm>({
    task_type: '',
    priority: 'medium',
    agents_required: 1,
    description: ''
  });

  const handleSubmit = async () => {
    const success = await onSubmit(coordinationForm);
    if (success) {
      // Reset form
      setCoordinationForm({
        task_type: '',
        priority: 'medium',
        agents_required: 1,
        description: ''
      });
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header="Multi-Agent Coordination"
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
              disabled={!coordinationForm.task_type}
            >
              Khởi tạo Coordination
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <FormField
            label="Loại Task"
            description="Mô tả loại công việc cần nhiều agent phối hợp"
            constraintText="Ví dụ: Complex Document Processing, Multi-step Validation"
          >
            <Input
              value={coordinationForm.task_type}
              onChange={({ detail }) =>
                setCoordinationForm({ ...coordinationForm, task_type: detail.value })
              }
              placeholder="Nhập loại task..."
            />
          </FormField>

          <FormField label="Độ ưu tiên">
            <Select
              selectedOption={
                PRIORITY_OPTIONS.find(opt => opt.value === coordinationForm.priority) ||
                PRIORITY_OPTIONS[1]
              }
              onChange={({ detail }) =>
                setCoordinationForm({
                  ...coordinationForm,
                  priority: detail.selectedOption.value as TaskPriority
                })
              }
              options={PRIORITY_OPTIONS}
            />
          </FormField>

          <FormField
            label="Số lượng Agents"
            description="Số lượng agents cần thiết để hoàn thành task"
            constraintText="Tối thiểu: 1, Tối đa: 10"
          >
            <Input
              type="number"
              value={String(coordinationForm.agents_required)}
              onChange={({ detail }) =>
                setCoordinationForm({
                  ...coordinationForm,
                  agents_required: Math.min(10, Math.max(1, parseInt(detail.value) || 1))
                })
              }
            />
          </FormField>

          <FormField
            label="Mô tả chi tiết"
            description="Thông tin chi tiết về task và yêu cầu coordination"
          >
            <Textarea
              value={coordinationForm.description}
              onChange={({ detail }) =>
                setCoordinationForm({ ...coordinationForm, description: detail.value })
              }
              placeholder="Nhập mô tả chi tiết về task cần coordination..."
              rows={4}
            />
          </FormField>

          <Box variant="awsui-key-label">
            <strong>Lưu ý:</strong> Coordination engine sẽ tự động chọn các agents phù hợp
            dựa trên khả năng và tải hiện tại.
          </Box>
        </SpaceBetween>
      </Form>
    </Modal>
  );
};

export default CoordinationModal;
