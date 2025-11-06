// Chat/Conversation API
import { API_PREFIX, API_BASE_URL } from './config';
import type { ApiResponse, ConversationRequest, ConversationResponse } from './types';

export const chatAPI = {
  startConversation: async (userId: string): Promise<ApiResponse<ConversationResponse>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/conversation/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
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

  sendMessage: async (request: ConversationRequest): Promise<ApiResponse<ConversationResponse>> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/conversation/chat`, {
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

  streamChat: async (request: ConversationRequest): Promise<ReadableStream> => {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/conversation/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body!;
  },

  // Legacy methods for compatibility
  getChatSessions: async () => ({ success: true, data: [] }),
  getMessages: async (sessionId: string) => ({ success: true, data: [] }),
};
