// Knowledge Base API
import { API_PREFIX, API_BASE_URL } from './config';

export const knowledgeAPI = {
  searchDocuments: async (query: string, category?: string, limit?: number) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/knowledge/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, category, limit }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/knowledge/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/knowledge/stats`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  uploadDocuments: async (files: File[], category: string, tags: string, description: string) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/knowledge/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};
