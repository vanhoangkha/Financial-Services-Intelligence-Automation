// API Service - Modular Architecture
// Main entry point for all API modules

import { apiClient } from './client';

// Export configuration
export { API_BASE_URL, API_PREFIX, PUBLIC_PREFIX, API_TIMEOUT } from './config';

// Export types
export type {
  ApiResponse,
  SummaryRequest,
  SummaryResponse,
  ConversationRequest,
  ConversationResponse,
  HealthCheckResponse,
  CreditAssessmentRequest,
  CreditAssessmentResult,
} from './types';

// Export client
export { ApiClient, apiClient } from './client';

// Export all API modules
export { healthAPI } from './health';
export { textAPI } from './text';
export { chatAPI } from './chat';
export { agentAPI, agentManagementAPI } from './agents';
export { complianceAPI } from './compliance';
export { knowledgeAPI } from './knowledge';
export { creditAPI } from './credit';
export { riskAnalyticsAPI } from './risk';
export { pureStrandsAPI } from './strands';
export { systemHealthAPI } from './system';

// Default export for convenience
export default apiClient;
