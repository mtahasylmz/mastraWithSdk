import { useState, useEffect, useCallback } from 'react';
import { mastra_sdk } from '@/lib/mastraClient';
import { MASTRA_CONFIG, THREAD_CONFIG } from '@/lib/mastra-config';

interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface UseThreadsReturn {
  threads: Thread[];
  loading: boolean;
  error: string | null;
  fetchThreads: () => Promise<void>;
  generateThreadId: () => string;
  deleteThread: (threadId: string) => Promise<boolean>;
  refreshThreads: () => Promise<void>;
}

export const useThreads = (): UseThreadsReturn => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeApiCall = async <T,>(apiFunction: () => Promise<T>): Promise<T | null> => {
    try {
      setError(null);
      return await apiFunction();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  };

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await safeApiCall(() => 
        mastra_sdk.getMemoryThreads({
          resourceId: MASTRA_CONFIG.resourceId,
          agentId: MASTRA_CONFIG.agentId,
        })
      );
      
      if (result && Array.isArray(result)) {
        const sortedThreads = result.sort((a: Thread, b: Thread) => {
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bUpdated - aUpdated;
        });
        
        setThreads(sortedThreads);
      } else {
        setThreads([]);
      }
    } catch (err) {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateThreadId = useCallback((): string => {
    const uniquePart = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const threadId = `thread_${uniquePart}`;
    return threadId;
  }, []);

  const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    try {
      const thread = await mastra_sdk.getMemoryThread(threadId, MASTRA_CONFIG.agentId);
      if (thread && typeof thread.delete === 'function') {
        await thread.delete();
        setThreads(prev => prev.filter(t => t.id !== threadId));
        return true;
      }
    } catch (err) {
      setError('Failed to delete thread');
    }
    return false;
  }, []);

  const refreshThreads = useCallback(async () => {
    await fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    loading,
    error,
    fetchThreads,
    generateThreadId,
    deleteThread,
    refreshThreads,
  };
}; 