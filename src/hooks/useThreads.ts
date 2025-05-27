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
  createThread: (title?: string, metadata?: Record<string, any>) => Promise<Thread | null>;
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
        console.log('✅ fetchThreads: Setting threads, count:', result.length);
        console.log('📋 fetchThreads: Thread IDs:', result.map(t => t.id));
        setThreads(result);
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

  const createThread = useCallback(async (
    title: string = THREAD_CONFIG.defaultTitle,
    metadata: Record<string, any> = THREAD_CONFIG.defaultMetadata
  ): Promise<Thread | null> => {
    console.log('🔄 Creating thread with:', { title, metadata });
    
    // Generate a more unique thread ID using crypto.randomUUID if available, otherwise fallback
    const threadId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `thread_${crypto.randomUUID()}` 
      : `thread_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    console.log('🆔 Generated threadId:', threadId);
    
    const newThread = await safeApiCall(() =>
      mastra_sdk.createMemoryThread({
        threadId,
        title,
        metadata,
        resourceId: MASTRA_CONFIG.resourceId,
        agentId: MASTRA_CONFIG.agentId,
      })
    );

    console.log('📦 Raw response from createMemoryThread:', newThread);

    if (newThread) {
      // Use the actual thread ID returned by Mastra (in case it's different from what we provided)
      const actualThread: Thread = {
        id: newThread.id, // Use Mastra's actual thread ID
        title: newThread.title,
        metadata: newThread.metadata,
        createdAt: newThread.createdAt,
        updatedAt: newThread.updatedAt,
      };
      
      console.log('✅ Processed thread object:', actualThread);
      console.log('📋 Current threads before update:', threads.length);
      
      // Add to local state immediately for responsive UI
      setThreads(prev => {
        const updated = [actualThread, ...prev];
        console.log('📋 Updated threads array length:', updated.length);
        console.log('📋 Updated threads:', updated.map(t => ({ id: t.id, title: t.title })));
        return updated;
      });
      
      // Refresh threads from server to ensure persistence
      console.log('🔄 Triggering fetchThreads for server sync...');
      fetchThreads().catch(err => {
        console.error('❌ Error during fetchThreads:', err);
      });
      
      return actualThread;
    } else {
      console.log('❌ createMemoryThread returned null/undefined');
    }
    
    return null;
  }, [fetchThreads, threads.length]);

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
    createThread,
    deleteThread,
    refreshThreads,
  };
}; 