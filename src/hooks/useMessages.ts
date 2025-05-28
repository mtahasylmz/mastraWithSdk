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
  addMessage: (message: UIMessage) => void;
  appendStreamedMessage: (message: UIMessage) => void;
  updateLastMessage: (updater: (prev: UIMessage) => UIMessage) => void;
}

// 🔥 NEW: Function to merge tool invocations from empty messages into content messages
const processMessagesForStreaming = (messages: UIMessage[]): UIMessage[] => {
  if (!messages || messages.length === 0) return messages;
  
  console.log('🔧 Processing messages to merge tool invocations:', messages.length);
  
  const processed: UIMessage[] = [];
  let i = 0;
  
  while (i < messages.length) {
    const message = messages[i];
    
    // If it's not an assistant message, just add it
    if (message.role !== 'assistant') {
      processed.push(message);
      i++;
      continue;
    }
    
    // If it's an assistant message with empty content but has tool invocations
    if (message.role === 'assistant' && 
        (!message.content || message.content.trim() === '') && 
        message.toolInvocations && 
        message.toolInvocations.length > 0) {
      
      console.log('🔧 Found empty assistant message with tool invocations:', message.toolInvocations);
      
      // Store the tool invocations and skip this message
      const storedToolInvocations = message.toolInvocations;
      i++; // Move to next message
      
      // Look for the next assistant message with content
      while (i < messages.length) {
        const nextMessage = messages[i];
        
        if (nextMessage.role === 'assistant' && nextMessage.content && nextMessage.content.trim() !== '') {
          console.log('🔧 Found next assistant message with content, merging tool invocations');
          
          // Create parts array for the message
          const parts: MessagePart[] = [];
          
          // Add tool invocation parts first (to show "tool called" before content)
          storedToolInvocations.forEach(toolInvocation => {
            parts.push({
              type: 'tool-invocation',
              toolInvocation: toolInvocation
            });
          });
          
          // Add the text content as a part
          if (nextMessage.content) {
            parts.push({
              type: 'text',
              text: nextMessage.content
            });
          }
          
          // Copy any existing parts
          if (nextMessage.parts) {
            parts.push(...nextMessage.parts);
          }
          
          // Create the merged message
          const mergedMessage: UIMessage = {
            ...nextMessage,
            parts: parts,
            toolInvocations: [
              ...(nextMessage.toolInvocations || []),
              ...storedToolInvocations
            ]
          };
          
          processed.push(mergedMessage);
          i++;
          break;
        } else {
          // If we find another message that's not the content assistant message, 
          // add it normally and continue looking
          processed.push(nextMessage);
          i++;
        }
      }
    } else {
      // Regular assistant message with content, add it normally
      processed.push(message);
      i++;
    }
  }
  
  console.log('🔧 Processed messages:', processed.length, 'from original:', messages.length);
  return processed;
};

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedThreadId, setLastFetchedThreadId] = useState<string | null>(null);

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
      setLastFetchedThreadId(null);
      return;
    }

    if (lastFetchedThreadId === threadId && messages.length > 0) {
      console.log('📝 Skipping fetch - messages already loaded for thread:', threadId);
      return;
    }

    setLoading(true);
    try {
      const thread = await mastra_sdk.getMemoryThread(threadId, MASTRA_CONFIG.agentId);

      if (thread && typeof thread.getMessages === 'function') {
        try {
          const messagesResponse = await thread.getMessages();
          
          if (messagesResponse && (messagesResponse as any).uiMessages) {
            // 🔥 NEW: Process messages to merge tool invocations
            const processedMessages = processMessagesForStreaming((messagesResponse as any).uiMessages);
            setMessages(processedMessages);
            setLastFetchedThreadId(threadId);
          } else if (messagesResponse && (messagesResponse as any).messages) {
            const convertedMessages: UIMessage[] = (messagesResponse as any).messages.map((msg: any) => ({
              id: msg.id || Date.now().toString(),
              content: msg.content || '',
              role: msg.role || 'assistant',
              createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
              parts: msg.parts || [],
              toolInvocations: msg.toolInvocations || [],
              reasoning: msg.reasoning,
            }));
            // 🔥 NEW: Process converted messages too
            const processedMessages = processMessagesForStreaming(convertedMessages);
            setMessages(processedMessages);
            setLastFetchedThreadId(threadId);
          } else {
            setMessages([]);
            setLastFetchedThreadId(threadId);
          }
          
          setError(null);
          
        } catch (messageError: any) {
          if (messageError?.status === 404 || 
              messageError?.message?.includes('404') || 
              messageError?.message?.includes('not found') ||
              messageError?.message?.includes('Thread not found')) {
            console.log('📝 Thread not found (expected for new threads):', threadId);
            setMessages([]);
            setLastFetchedThreadId(threadId);
            setError(null);
          } else {
            console.error('Error fetching messages:', messageError);
            setError(messageError instanceof Error ? messageError.message : 'Failed to load messages');
            setMessages([]);
            setLastFetchedThreadId(null);
          }
        }
      } else {
        console.warn('Thread object invalid or missing getMessages method');
        setMessages([]);
        setLastFetchedThreadId(threadId);
        setError(null);
      }
    } catch (err: any) {
      if (err?.status === 404 || 
          err?.message?.includes('404') || 
          err?.message?.includes('not found') ||
          err?.message?.includes('Thread not found')) {
        console.log('📝 Thread not found (expected for new threads):', threadId);
        setMessages([]);
        setLastFetchedThreadId(threadId);
        setError(null);
      } else {
        console.error('Error getting thread:', err);
        setError(err instanceof Error ? err.message : 'Failed to load thread');
        setMessages([]);
        setLastFetchedThreadId(null);
      }
    } finally {
      setLoading(false);
    }
  }, [messages.length, lastFetchedThreadId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastFetchedThreadId(null);
    setError(null);
  }, []);

  const addMessage = useCallback((message: UIMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const appendStreamedMessage = useCallback((message: UIMessage) => {
    setMessages(prev => {
      const withoutStreaming = prev.filter(msg => !msg.id.startsWith('streaming_'));
      return [...withoutStreaming, message];
    });
  }, []);

  const updateLastMessage = useCallback((updater: (prev: UIMessage) => UIMessage) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = updater(updated[updated.length - 1]);
      return updated;
    });
  }, []);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    clearMessages,
    addMessage,
    appendStreamedMessage,
    updateLastMessage,
  };
}; 