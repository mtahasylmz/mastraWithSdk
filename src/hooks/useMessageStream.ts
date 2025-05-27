import { useState, useCallback } from 'react';
import { mastra_sdk } from '@/lib/mastraClient';
import { MASTRA_CONFIG } from '@/lib/mastra-config';
import { UIMessage } from './useMessages';

// Based on Mastra SDK MessagePart structure  
interface MessagePart {
  type: 'text' | 'reasoning' | 'tool-invocation' | 'source' | 'file' | 'step-start';
  text?: string;
  reasoning?: string;
  toolInvocation?: any;
  source?: any;
  mimeType?: string;
  data?: string;
}

interface StreamingMessage extends Omit<UIMessage, 'parts'> {
  isStreaming?: boolean;
  parts?: MessagePart[];
}

interface UseMessageStreamReturn {
  isStreaming: boolean;
  streamingMessage: StreamingMessage | null;
  error: string | null;
  sendMessage: (message: string, threadId: string, onComplete?: () => void) => Promise<void>;
  clearStreamingMessage: () => void;
}

export const useMessageStream = (): UseMessageStreamReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearStreamingMessage = useCallback(() => {
    setStreamingMessage(null);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (message: string, threadId: string, onComplete?: () => void) => {
    try {
      setError(null);
      setIsStreaming(true);

      // Create initial assistant message for streaming
      const assistantMessage: StreamingMessage = {
        id: `streaming_${Date.now()}`,
        role: 'assistant',
        content: '',
        isStreaming: true,
        parts: []
      };
      
      setStreamingMessage(assistantMessage);

      // Get agent instance and start streaming
      const agent = mastra_sdk.getAgent(MASTRA_CONFIG.agentId);
      const response = await agent.stream({
        messages: [message],
        resourceId: MASTRA_CONFIG.resourceId,
        threadId: threadId
      });

      // Process the stream
      await response.processDataStream({
        onTextPart: (text: string) => {
          setStreamingMessage(prev => {
            if (!prev) return null;
            return {
              ...prev,
              content: prev.content + text,
              parts: [
                ...(prev.parts || []),
                { type: 'text', text }
              ]
            };
          });
        },

        onReasoningPart: (reasoning: string) => {
          setStreamingMessage(prev => {
            if (!prev) return null;
            return {
              ...prev,
              parts: [
                ...(prev.parts || []),
                { type: 'reasoning', reasoning }
              ]
            };
          });
        },

        onToolCallPart: (toolCall: any) => {
          setStreamingMessage(prev => {
            if (!prev) return null;
            return {
              ...prev,
              parts: [
                ...(prev.parts || []),
                { type: 'tool-invocation', toolInvocation: toolCall }
              ]
            };
          });
        },

        onFinishMessagePart: async (finishedMessage: any) => {
          console.log('🏁 Stream finished');
          
          setStreamingMessage(prev => {
            if (!prev) return null;
            return {
              ...prev,
              isStreaming: false
            };
          });
          setIsStreaming(false);
          
          // Call the completion callback if provided
          if (onComplete) {
            console.log('🔄 Calling completion callback...');
            onComplete();
          }
        },

        onErrorPart: (errorData: any) => {
          console.error('Stream error:', errorData);
          setError('Failed to stream message');
          setIsStreaming(false);
        }
      });

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsStreaming(false);
      setStreamingMessage(null);
    }
  }, []);

  return {
    isStreaming,
    streamingMessage,
    error,
    sendMessage,
    clearStreamingMessage
  };
}; 