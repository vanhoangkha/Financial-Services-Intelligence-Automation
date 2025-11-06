// System Health API
import { API_PREFIX, API_BASE_URL } from './config';

export const systemHealthAPI = {
  getSystemHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getDetailedHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/detailed`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getAgentsHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/agents`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getComplianceHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/compliance`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getRiskHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/risk`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getTextHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/text`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getKnowledgeHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/knowledge`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getDocumentHealth: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/health/health/document`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};
