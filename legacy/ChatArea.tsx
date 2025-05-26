'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { mastra_sdk } from '@/lib/mastraClient';
import { MessageSquare, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UIMessage {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  createdAt?: Date;
  reasoning?: string;
  annotations?: any[];
  toolInvocations?: Array<any>;
  parts?: Array<any>;
  experimental_attachments?: any[];
  data?: any;
}

interface ChatAreaProps {
  selectedThreadId: string | null;
  agentId: string;
}

export function ChatArea({ selectedThreadId, agentId }: ChatAreaProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch messages for selected thread
  const fetchMessages = async (threadId: string) => {
    try {
      setLoading(true);
      const thread = await mastra_sdk.getMemoryThread(threadId, agentId);
      
      if (thread && typeof thread.getMessages === 'function') {
        const messagesResponse = await thread.getMessages();
        
        // Use uiMessages for display (preferred)
        if (messagesResponse.uiMessages) {
          setMessages(messagesResponse.uiMessages);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Send message (placeholder - you'll need to implement actual message sending)
  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId || !content.trim()) return;

    try {
      setSending(true);
      
      // Add user message optimistically to UI
      const userMessage: UIMessage = {
        id: `temp_${Date.now()}`,
        content: content.trim(),
        role: 'user',
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);

      // TODO: Implement actual message sending to Mastra agent
      // This would typically involve calling your agent endpoint
      // For now, we'll just add a placeholder assistant response
      
      setTimeout(() => {
        const assistantMessage: UIMessage = {
          id: `temp_assistant_${Date.now()}`,
          content: "I'm your Academic Research Assistant powered by Mastra. I can help you find and analyze arXiv papers. Message sending is not yet fully implemented in this demo, but I received your message: " + content,
          role: 'assistant',
          createdAt: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setSending(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedThreadId) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Academic Research Assistant</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              How can I help you today?
            </h1>
            <p className="text-gray-600 mb-8">
              I'm your AI research assistant. I can help you find academic papers, 
              summarize research, and answer questions about scientific literature.
            </p>
            
            {/* Example prompts */}
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="text-left justify-start h-auto p-4 text-gray-700 hover:bg-gray-100"
                onClick={() => {/* TODO: Set example prompt */}}
              >
                <div>
                  <div className="font-medium">Find papers about machine learning</div>
                  <div className="text-sm text-gray-500">Search for recent ML research</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="text-left justify-start h-auto p-4 text-gray-700 hover:bg-gray-100"
                onClick={() => {/* TODO: Set example prompt */}}
              >
                <div>
                  <div className="font-medium">Explain quantum computing</div>
                  <div className="text-sm text-gray-500">Get an overview of quantum technology</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Academic Research Assistant</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-white">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
                <p className="text-gray-600 max-w-sm">
                  Ask me anything about academic research, papers, or scientific topics.
                </p>
              </div>
            ) : (
              <MessageList messages={messages} />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-white">
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={loading || sending}
          placeholder="Message Academic Research Assistant..."
        />
      </div>
    </div>
  );
} 