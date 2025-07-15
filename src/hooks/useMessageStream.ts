import { useState, useCallback } from 'react';
import { mastra_sdk } from '@/lib/mastraClient';
import { MASTRA_CONFIG } from '@/lib/mastra-config';
import { UIMessage } from './useMessages';


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
  sendMessage: (message: string, threadId: string, onComplete?: (assistantMessage: UIMessage) => void) => Promise<void>;
  clearStreamingMessage: () => void;
}

const ratelimitId = 'message-stream';

export const useMessageStream = (): UseMessageStreamReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearStreamingMessage = useCallback(() => {
    setStreamingMessage(null);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (message: string, threadId: string, onComplete?: (assistantMessage: UIMessage) => void) => {
    try {
      setError(null);
      setIsStreaming(true);

      let finalContent = '';
      let finalParts: MessagePart[] = [];
      let finalReasoning = '';
      let finalToolInvocations: any[] = [];

      let currentStreamingMessage: StreamingMessage = {
        id: `streaming_${Date.now()}`,
        role: 'assistant',
        content: '',
        isStreaming: true,
        parts: [],
        createdAt: new Date()
      };
      
      setStreamingMessage(currentStreamingMessage);

      const agent = mastra_sdk.getAgent(MASTRA_CONFIG.agentId);



      try {
        const rateLimitResponse = await fetch(`/api/ratelimit?id=${ratelimitId}`);
        const { isLimited } = await rateLimitResponse.json();
        
        if (isLimited) {
          setError('Rate limit exceeded. Please try again later.');
          setIsStreaming(false);
          setStreamingMessage(null);
          return;
        }
      } catch (rateLimitError) {
        // If rate limit check fails, continue anyway (fail open)
        console.warn('Rate limit check failed, continuing with request:', rateLimitError);
      }
        
      const response = await agent.stream({
        messages: [message],
        resourceId: MASTRA_CONFIG.resourceId,
        threadId: threadId
      });

      await response.processDataStream({
        onTextPart: (text: string) => {
          
          finalContent += text;
          const textPart = { type: 'text' as const, text };
          finalParts.push(textPart);
          
          currentStreamingMessage = {
            ...currentStreamingMessage,
            content: currentStreamingMessage.content + text,
            parts: [...(currentStreamingMessage.parts || []), textPart],
          };
          
          setStreamingMessage({ ...currentStreamingMessage });
        },

        onReasoningPart: (reasoning: string) => {
          
          finalReasoning = reasoning;
          const reasoningPart = { type: 'reasoning' as const, reasoning };
          finalParts.push(reasoningPart);
          
          currentStreamingMessage = {
            ...currentStreamingMessage,
            reasoning,
            parts: [...(currentStreamingMessage.parts || []), reasoningPart]
          };
          
          setStreamingMessage({ ...currentStreamingMessage });
        },

        onToolCallPart: (toolCall: any) => {
          
          finalToolInvocations.push(toolCall);
          const toolPart = { type: 'tool-invocation' as const, toolInvocation: toolCall };
          finalParts.push(toolPart);
          
          currentStreamingMessage = {
            ...currentStreamingMessage,
            toolInvocations: [...(currentStreamingMessage.toolInvocations || []), toolCall],
            parts: [...(currentStreamingMessage.parts || []), toolPart]
          };
          
          setStreamingMessage({ ...currentStreamingMessage });
        },

        onFinishMessagePart: async (finishedMessage: any) => {
          
          currentStreamingMessage = {
            ...currentStreamingMessage,
            isStreaming: false
          };
          
          setStreamingMessage({ ...currentStreamingMessage });
          setIsStreaming(false);
          
          const finalAssistantMessage: UIMessage = {
            id: `assistant_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            role: 'assistant',
            content: finalContent,
            createdAt: new Date(),
            parts: finalParts.length > 0 ? finalParts : undefined,
            reasoning: finalReasoning || undefined,
            toolInvocations: finalToolInvocations.length > 0 ? finalToolInvocations : undefined,
          };
          
          if (onComplete) {
            onComplete(finalAssistantMessage);
          }
        },

        onErrorPart: (errorData: any) => {
          setError('Failed to stream message');
          setIsStreaming(false);
        }
      });

    } catch (err) {
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