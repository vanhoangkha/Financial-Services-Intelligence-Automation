// Health Check API
import { PUBLIC_PREFIX } from './config';
import { apiClient } from './client';
import type { ApiResponse, HealthCheckResponse } from './types';

export const healthAPI = {
  checkHealth: (): Promise<ApiResponse<HealthCheckResponse>> => {
    return apiClient['request']<HealthCheckResponse>(`${PUBLIC_PREFIX}/health-check/health`);
  }
};
