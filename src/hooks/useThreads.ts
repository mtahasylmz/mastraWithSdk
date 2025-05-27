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
      console.error('API call failed:', err);
      return null;
    }
  };

  const fetchThreads = useCallback(async () => {
    console.log('🔄 fetchThreads: Starting to fetch threads from server...');
    setLoading(true);
    try {
      const result = await safeApiCall(() => 
        mastra_sdk.getMemoryThreads({
          resourceId: MASTRA_CONFIG.resourceId,
          agentId: MASTRA_CONFIG.agentId,
        })
      );
      
      console.log('📦 fetchThreads: Raw result from getMemoryThreads:', result);
      console.log('📦 fetchThreads: Result type:', typeof result, 'isArray:', Array.isArray(result));
      
      if (result && Array.isArray(result)) {
        // Sort threads by updatedAt in descending order (newest first)
        const sortedThreads = result.sort((a: Thread, b: Thread) => {
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bUpdated - aUpdated;
        });
        
        console.log('✅ fetchThreads: Setting sorted threads, count:', sortedThreads.length);
        console.log('📋 fetchThreads: Thread IDs (sorted by updatedAt):', sortedThreads.map(t => ({ 
          id: t.id, 
          title: t.title, 
          updatedAt: t.updatedAt 
        })));
        setThreads(sortedThreads);
      } else {
        console.log('⚠️ fetchThreads: No valid array result, setting empty array');
        setThreads([]);
      }
    } catch (err) {
      console.error('❌ fetchThreads: Error fetching threads:', err);
      setThreads([]);
    } finally {
      setLoading(false);
      console.log('🏁 fetchThreads: Completed');
    }
  }, []);

  const generateThreadId = useCallback((): string => {
    const uniquePart = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const threadId = `thread_${uniquePart}`;
    console.log('🆔 Generated new thread ID for auto-creation:', threadId);
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
      console.error('Error deleting thread:', err);
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