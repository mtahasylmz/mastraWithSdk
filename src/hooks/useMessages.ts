import { useState, useCallback } from 'react';
import { mastra_sdk } from '@/lib/mastraClient';
import { MASTRA_CONFIG } from '@/lib/mastra-config';

// Based on Mastra SDK UIMessage structure
interface MessagePart {
  type: 'text' | 'reasoning' | 'tool-invocation' | 'source' | 'file' | 'step-start';
  text?: string;
  reasoning?: string;
  toolInvocation?: any;
  source?: any;
  mimeType?: string;
  data?: string;
}

export interface UIMessage {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  createdAt?: Date | string;
  reasoning?: string;
  annotations?: any[];
  toolInvocations?: any[];
  parts?: MessagePart[];
  experimental_attachments?: any[];
  data?: any;
}

interface UseMessagesReturn {
  messages: UIMessage[];
  loading: boolean;
  error: string | null;
  fetchMessages: (threadId: string) => Promise<void>;
  clearMessages: () => void;
}

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
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

  const fetchMessages = useCallback(async (threadId: string) => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      // getMemoryThread returns MemoryThread directly, not a promise
      const thread = await mastra_sdk.getMemoryThread(threadId, MASTRA_CONFIG.agentId);

      if (thread && typeof thread.getMessages === 'function') {
        const messagesResponse = await safeApiCall(() => thread.getMessages());
        
        if (messagesResponse && (messagesResponse as any).uiMessages) {
          // Use uiMessages for display (preferred by Mastra)
          setMessages((messagesResponse as any).uiMessages);
        } else if (messagesResponse && (messagesResponse as any).messages) {
          // Fallback to regular messages if uiMessages not available
          const convertedMessages: UIMessage[] = (messagesResponse as any).messages.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            content: msg.content || '',
            role: msg.role || 'assistant',
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            parts: msg.parts || [],
            toolInvocations: msg.toolInvocations || [],
            reasoning: msg.reasoning,
          }));
          setMessages(convertedMessages);
        } else {
          setMessages([]);
        }
      } else {
        console.warn('Thread object invalid or missing getMessages method');
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    clearMessages,
  };
}; 