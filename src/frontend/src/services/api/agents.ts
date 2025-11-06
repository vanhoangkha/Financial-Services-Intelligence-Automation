// Agent Management API
import { API_PREFIX, API_BASE_URL } from './config';

// Mock agent API for now
export const agentAPI = {
  getAgents: async () => ({
    success: true,
    data: [
      {
        id: 'risk-assessment-agent',
        name: 'Risk Assessment Agent',
        description: 'Chuyên gia phân tích và đánh giá rủi ro doanh nghiệp',
        status: 'active' as const,
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 8192,
        capabilities: ['Risk Analysis', 'Document Processing', 'Vietnamese Support'],
        systemPrompt: 'Bạn là một chuyên gia phân tích rủi ro doanh nghiệp...',
        createdAt: new Date(),
      },
      {
        id: 'document-processor',
        name: 'Document Processor',
        description: 'Chuyên xử lý và tóm tắt tài liệu',
        status: 'active' as const,
        model: 'claude-3-sonnet',
        temperature: 0.5,
        maxTokens: 8192,
        capabilities: ['Document Summarization', 'Text Analysis', 'Multi-language'],
        systemPrompt: 'Bạn là một chuyên gia xử lý tài liệu...',
        createdAt: new Date(),
      },
    ]
  }),
  createAgent: async (agentData: any) => ({ success: true, data: { id: 'new-agent' } }),
  updateAgent: async (id: string, agentData: any) => ({ success: true }),
  deleteAgent: async (id: string) => ({ success: true }),
};

// Agent Management API (Real backend endpoints)

export const agentManagementAPI = {
  getAgentsList: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agents/list`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getAgentsHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agents/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  assignTask: async (taskData: any) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agents/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  coordinateAgents: async (coordinationData: any) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/agents/coordinate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coordinationData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};
