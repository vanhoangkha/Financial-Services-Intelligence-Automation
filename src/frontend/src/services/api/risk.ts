// Risk Analytics API
import { API_PREFIX, API_BASE_URL } from './config';

export const riskAnalyticsAPI = {
  getMarketData: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/risk/market-data`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getRiskHistory: async (entityId: string) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/risk/score/history/${entityId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  monitorEntity: async (entityId: string) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/risk/monitor/${entityId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  configureAlert: async (alertData: any) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/risk/alert/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};
