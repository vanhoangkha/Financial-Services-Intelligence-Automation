/**
 * useFileUpload - File Upload Hook
 *
 * Generic hook for handling file uploads with progress tracking.
 * Supports any endpoint and additional form data.
 *
 * @example
 * const { uploading, progress, error, upload } = useFileUpload();
 *
 * await upload(
 *   file,
 *   '/api/v1/compliance/document',
 *   { document_type: 'invoice' }
 * );
 */

import { useState, useCallback } from 'react';

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  upload: (
    file: File,
    endpoint: string,
    additionalData?: Record<string, string>
  ) => Promise<any>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (
    file: File,
    endpoint: string,
    additionalData?: Record<string, string>
  ) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    // Add additional data to form
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      // Simulate progress (in real app, use XHR with progress events)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Reset progress after a short delay
      setTimeout(() => setProgress(0), 1000);

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploading,
    progress,
    error,
    upload
  };
}

export default useFileUpload;
