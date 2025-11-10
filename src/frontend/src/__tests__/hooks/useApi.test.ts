/**
 * Unit Tests for useApi Hook
 *
 * Tests the generic API hook functionality including:
 * - Successful data fetching
 * - Error handling
 * - Loading states
 * - Manual execution
 * - Auto-fetch behavior
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../../hooks/useApi';

describe('useApi Hook', () => {
  it('should fetch data successfully with autoFetch', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { id: 1, name: 'Test Agent' }
    });

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true })
    );

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check final state
    expect(result.current.data).toEqual({ id: 1, name: 'Test Agent' });
    expect(result.current.error).toBeNull();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should handle errors properly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'error',
      message: 'Failed to fetch data'
    });

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch data');
    expect(result.current.data).toBeNull();
  });

  it('should handle exceptions', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('should not auto-fetch when autoFetch is false', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { test: 'data' }
    });

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: false })
    );

    // Should not fetch automatically
    expect(result.current.loading).toBe(false);
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should execute manually when called', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { count: 1 }
    });

    const { result } = renderHook(() => useApi(mockFetcher));

    // Execute manually
    await result.current.execute();

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ count: 1 });
  });

  it('should refetch data', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { count: 1 }
    });

    const { result } = renderHook(() => useApi(mockFetcher));

    // First fetch
    await result.current.execute();
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    // Refetch
    await result.current.refetch();
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should call onSuccess callback', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'success',
      data: { id: 123 }
    });

    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true, onSuccess })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(onSuccess).toHaveBeenCalledWith({ id: 123 });
  });

  it('should call onError callback', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      status: 'error',
      message: 'Test error'
    });

    const onError = jest.fn();

    const { result } = renderHook(() =>
      useApi(mockFetcher, { autoFetch: true, onError })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(onError).toHaveBeenCalledWith('Test error');
  });
});
