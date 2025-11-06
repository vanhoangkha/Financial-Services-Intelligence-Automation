// Compliance Validation API
import { API_PREFIX, API_BASE_URL } from './config';

export const complianceAPI = {
  validateCompliance: async (request: any) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/compliance/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  validateDocumentFile: async (file: File, documentType?: string, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);

    if (documentType) {
      formData.append('document_type', documentType);
    }

    if (metadata) {
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          formData.append(key, metadata[key]);
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/compliance/document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  queryRegulations: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/compliance/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },
};
