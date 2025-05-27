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
  sendMessage: (message: string, threadId: string, onComplete?: (assistantMessage: UIMessage) => void) => Promise<void>;
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

  const sendMessage = useCallback(async (message: string, threadId: string, onComplete?: (assistantMessage: UIMessage) => void) => {
    try {
      setError(null);
      setIsStreaming(true);

      // 🔥 NEW: Track all collected content for final message
      let finalContent = '';
      let finalParts: MessagePart[] = [];
      let finalReasoning = '';
      let finalToolInvocations: any[] = [];

      // 🔥 IMPROVED: Create a stable streaming message that we'll update
      let currentStreamingMessage: StreamingMessage = {
        id: `streaming_${Date.now()}`,
        role: 'assistant',
        content: '',
        isStreaming: true,
        parts: [],
        createdAt: new Date()
      };
      
      console.log('🚀 Starting stream, initial message:', currentStreamingMessage);
      
      // Set initial streaming message
      setStreamingMessage(currentStreamingMessage);

      // Get agent instance and start streaming
      const agent = mastra_sdk.getAgent(MASTRA_CONFIG.agentId);
      
      console.log('📡 Starting agent stream...');
      
      const response = await agent.stream({
        messages: [message],
        resourceId: MASTRA_CONFIG.resourceId,
        threadId: threadId
      });

      console.log('📡 Stream response received, processing...');

      // Process the stream
      await response.processDataStream({
        onTextPart: (text: string) => {
          console.log('📝 Streaming text chunk:', text);
          
          finalContent += text;
          const textPart = { type: 'text' as const, text };
          finalParts.push(textPart);
          
          // 🔥 IMPROVED: Update both local reference and state
          currentStreamingMessage = {
            ...currentStreamingMessage,
            content: currentStreamingMessage.content + text,
            parts: [...(currentStreamingMessage.parts || []), textPart],
          };
          
          console.log('📝 Updated streaming content:', {
            contentLength: currentStreamingMessage.content.length,
            recentContent: currentStreamingMessage.content.slice(-20),
            isStreaming: currentStreamingMessage.isStreaming
          });
          
          // Update state with the new message
          setStreamingMessage({ ...currentStreamingMessage });
        },

        onReasoningPart: (reasoning: string) => {
          console.log('💭 Streaming reasoning:', reasoning);
          
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
          console.log('🔧 Streaming tool call:', toolCall);
          
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
          console.log('🏁 Stream finished');
          
          // 🔥 IMPROVED: Mark current streaming message as complete
          currentStreamingMessage = {
            ...currentStreamingMessage,
            isStreaming: false
          };
          
          setStreamingMessage({ ...currentStreamingMessage });
          setIsStreaming(false);
          
          // 🔥 NEW: Create final UIMessage from collected data
          const finalAssistantMessage: UIMessage = {
            id: `assistant_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            role: 'assistant',
            content: finalContent,
            createdAt: new Date(),
            parts: finalParts.length > 0 ? finalParts : undefined,
            reasoning: finalReasoning || undefined,
            toolInvocations: finalToolInvocations.length > 0 ? finalToolInvocations : undefined,
          };
          
          // 🔥 NEW: Call completion callback with the final assistant message
          if (onComplete) {
            console.log('🔄 Calling completion callback with assistant message...');
            onComplete(finalAssistantMessage);
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