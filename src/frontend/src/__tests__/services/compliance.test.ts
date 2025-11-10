/**
 * Unit Tests for Compliance API Service
 *
 * Tests the compliance validation API functionality
 */

import complianceAPI from '../../services/api/compliance';

// Mock fetch globally
global.fetch = jest.fn();

describe('Compliance API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate text compliance', async () => {
    const testData = {
      text: 'Letter of Credit LC123456...',
      document_type: 'letter_of_credit'
    };

    const mockResponse = {
      status: 'success',
      data: {
        compliance_status: 'COMPLIANT',
        confidence_score: 0.95,
        violations: []
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await complianceAPI.validateCompliance(testData);

    expect(result.status).toBe('success');
    expect(result.data?.compliance_status).toBe('COMPLIANT');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/compliance/validate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(testData)
      })
    );
  });

  it('should validate document file', async () => {
    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf'
    });

    const mockResponse = {
      status: 'success',
      data: {
        compliance_status: 'COMPLIANT',
        file_info: {
          filename: 'test.pdf',
          file_size: 1024
        }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await complianceAPI.validateDocumentFile(file);

    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/compliance/document'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  it('should query UCP regulations', async () => {
    const query = 'What are the requirements for Letter of Credit?';

    const mockResponse = {
      status: 'success',
      data: {
        answer: 'According to UCP 600...',
        sources: []
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await complianceAPI.queryRegulations(query);

    expect(result.status).toBe('success');
    expect(result.data?.answer).toContain('UCP 600');
  });

  it('should get supported document types', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        supported_types: ['letter_of_credit', 'invoice', 'bill_of_lading']
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await complianceAPI.getSupportedTypes();

    expect(result.status).toBe('success');
    expect(Array.isArray(result.data?.supported_types)).toBe(true);
  });

  it('should handle compliance validation errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        status: 'error',
        message: 'Invalid document'
      })
    });

    const result = await complianceAPI.validateCompliance({
      text: '',
      document_type: 'unknown'
    });

    expect(result.status).toBe('error');
  });
});
