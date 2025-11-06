// Text Summarization API
import { API_PREFIX, API_BASE_URL } from './config';
import type { ApiResponse, SummaryRequest, SummaryResponse } from './types';

export const textAPI = {
  summarizeText: async (request: SummaryRequest): Promise<ApiResponse<SummaryResponse>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/text/summary/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  summarizeDocument: async (
    file: File,
    summaryType: string = 'general',
    language: string = 'vietnamese'
  ): Promise<ApiResponse<SummaryResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('summary_type', summaryType);
    formData.append('language', language);

    try {
      const url = `${API_BASE_URL}${API_PREFIX}/text/summary/document`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  getSummaryTypes: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/text/summary/types`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
