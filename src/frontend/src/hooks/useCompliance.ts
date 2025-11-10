/**
 * useCompliance - Compliance Validation Hook
 *
 * Hook for validating documents against compliance regulations.
 * Handles both text and file-based validation.
 *
 * @example
 * const {
 *   validating,
 *   result,
 *   error,
 *   validateDocument,
 *   validateText,
 *   reset
 * } = useCompliance();
 */

import { useState, useCallback } from 'react';
import complianceAPI from '../services/api/compliance';

interface ComplianceResult {
  compliance_status: string;
  confidence_score: number;
  document_type: string;
  violations: any[];
  recommendations: any[];
  [key: string]: any;
}

interface UseComplianceReturn {
  validating: boolean;
  result: ComplianceResult | null;
  error: string | null;
  validateDocument: (file: File, documentType?: string) => Promise<ComplianceResult | null>;
  validateText: (text: string, documentType?: string) => Promise<ComplianceResult | null>;
  reset: () => void;
}

export function useCompliance(): UseComplianceReturn {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateDocument = useCallback(async (
    file: File,
    documentType?: string
  ): Promise<ComplianceResult | null> => {
    setValidating(true);
    setError(null);
    setResult(null);

    try {
      const response = await complianceAPI.validateDocumentFile(
        file,
        documentType
      );

      if (response.status === 'success' && response.data) {
        setResult(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Validation failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  const validateText = useCallback(async (
    text: string,
    documentType?: string
  ): Promise<ComplianceResult | null> => {
    setValidating(true);
    setError(null);
    setResult(null);

    try {
      const response = await complianceAPI.validateCompliance({
        text,
        document_type: documentType
      });

      if (response.status === 'success' && response.data) {
        setResult(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Validation failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setValidating(false);
  }, []);

  return {
    validating,
    result,
    error,
    validateDocument,
    validateText,
    reset
  };
}

export default useCompliance;
