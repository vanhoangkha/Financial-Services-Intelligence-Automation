/**
 * useApi - Generic API Hook
 *
 * Reusable hook for handling API calls with loading, error, and data states.
 * Supports automatic fetching and manual execution.
 *
 * @example
 * const { data, loading, error, execute, refetch } = useApi(
 *   () => agentAPI.getAgents(),
 *   { autoFetch: true }
 * );
 */

import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

interface UseApiOptions {
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options?: UseApiOptions
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetcher();

      if (response.status === 'success') {
        setData(response.data || null);
        options?.onSuccess?.(response.data);
      } else {
        const errorMsg = response.message || 'Unknown error';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      options?.onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetcher, options]);

  useEffect(() => {
    if (options?.autoFetch) {
      execute();
    }
  }, [options?.autoFetch, execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  };
}

export default useApi;
