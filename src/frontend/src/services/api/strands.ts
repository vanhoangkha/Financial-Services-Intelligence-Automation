// Pure Strands API
import { API_PREFIX, API_BASE_URL } from './config';

export const pureStrandsAPI = {
  processMessage: async (message: string, file?: File) => {
    const formData = new FormData();
    formData.append('message', message);

    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/pure-strands/process`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/pure-strands/status`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};
