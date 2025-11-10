/**
 * Unit Tests for Health API Service
 *
 * Tests the health check API functionality
 */

import healthAPI from '../../services/api/health';

// Mock fetch globally
global.fetch = jest.fn();

describe('Health API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check main health successfully', async () => {
    const mockResponse = {
      status: 'healthy',
      service: 'ai-risk-assessment-api',
      timestamp: 1234567890
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await healthAPI.checkHealth();

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health-check/health')
    );
  });

  it('should check compliance health', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        service: 'compliance_validation',
        status: 'healthy'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await healthAPI.checkComplianceHealth();

    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/compliance/health')
    );
  });

  it('should check text summary health', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        service_status: 'healthy'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await healthAPI.checkTextSummaryHealth();

    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/text/summary/health')
    );
  });

  it('should handle health check errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    await expect(healthAPI.checkHealth()).rejects.toThrow('Network error');
  });

  it('should handle non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(healthAPI.checkHealth()).rejects.toThrow();
  });
});
