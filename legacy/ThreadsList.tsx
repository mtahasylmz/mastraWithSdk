'use client';

import React, { useState, useEffect } from 'react';
import { mastra_sdk } from '@/lib/mastraClient';

interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ThreadsListProps {
  resourceId: string;
  agentId: string;
  onThreadSelect?: (threadId: string) => void;
  selectedThreadId?: string;
}

export default function ThreadsList({ 
  resourceId, 
  agentId, 
  onThreadSelect,
  selectedThreadId 
}: ThreadsListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspectSingleThread = async (threadId: string) => {
    try {
      console.log('🔍 INSPECTING SINGLE THREAD:', threadId);
      console.log('📋 Using resourceId:', resourceId, 'agentId:', agentId);
      
      // Fetch single thread using getMemoryThread
      const thread = await mastra_sdk.getMemoryThread(threadId, agentId);

      console.log('🧵 SINGLE THREAD OBJECT:', thread);
      console.log('📊 Thread Type:', typeof thread);
      console.log('🏗️ Thread Constructor:', thread?.constructor?.name);
      
      // Test the getMessages method specifically
      console.log('📨 TESTING getMessages() METHOD:');
      if (thread && typeof (thread as any).getMessages === 'function') {
        console.log('✅ getMessages method found on thread object');
        
        try {
          // Call getMessages without parameters first
          console.log('🔄 Calling getMessages()...');
          const messages = await (thread as any).getMessages();
          console.log('📦 RAW MESSAGES RESPONSE:', messages);
          console.log('📊 Messages type:', typeof messages);
          console.log('📈 Messages length:', Array.isArray(messages) ? messages.length : 'Not an array');
          
          if (messages && typeof messages === 'object') {
            console.log('🔍 Message object keys:', Object.keys(messages));
            
            // Check if messages is an object with a messages property
            if ('messages' in messages) {
              console.log('📝 Thread messages:', messages.messages);
              console.log('📊 Thread messages count:', Array.isArray(messages.messages) ? messages.messages.length : 'Not an array');
            }
            
            // Check if messages has uiMessages
            if ('uiMessages' in messages) {
              console.log('🎨 UI messages:', messages.uiMessages);
              console.log('📊 UI messages count:', Array.isArray(messages.uiMessages) ? messages.uiMessages.length : 'Not an array');
            }
          }
          
          // Try with limit parameter
          console.log('🔄 Calling getMessages({ limit: 10 })...');
          const limitedMessages = await (thread as any).getMessages({ limit: 10 });
          console.log('📦 LIMITED MESSAGES RESPONSE:', limitedMessages);
          
        } catch (err) {
          console.error('❌ Error calling getMessages():', err);
        }
      } else {
        console.log('❌ getMessages method not found on thread object');
        
        // Log available methods
        if (thread) {
          const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(thread))
            .filter(prop => typeof (thread as any)[prop] === 'function' && prop !== 'constructor');
          console.log('🔧 Available methods on thread:', methods);
        }
      }
      
    } catch (err) {
      console.error('❌ Error inspecting thread:', err);
    }
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mastra_sdk.getMemoryThreads({
        resourceId,
        agentId,
      });
      
      // Convert to our Thread type
      const fetchedThreads = (response || []).map(thread => ({
        id: thread.id,
        title: thread.title || 'Untitled Conversation',
        metadata: thread.metadata,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
      }));
      
      setThreads(fetchedThreads);
      
      // Auto-inspect the first thread if available
      if (fetchedThreads.length > 0) {
        console.log('🎯 AUTO-INSPECTING FIRST THREAD...');
        await inspectSingleThread(fetchedThreads[0].id);
      }
      
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createNewThread = async () => {
    try {
      const threadId = `thread_${Date.now()}`;
      const newThread = await mastra_sdk.createMemoryThread({
        threadId,
        title: "New Conversation",
        metadata: { category: "general" },
        resourceId,
        agentId,
      });
      
      if (newThread) {
        const threadData: Thread = {
          id: newThread.id,
          title: newThread.title || 'New Conversation',
          metadata: newThread.metadata,
          createdAt: newThread.createdAt,
          updatedAt: newThread.updatedAt,
        };
        setThreads(prev => [threadData, ...prev]);
        onThreadSelect?.(newThread.id);
        
        // Inspect the newly created thread
        console.log('🆕 INSPECTING NEWLY CREATED THREAD...');
        await inspectSingleThread(newThread.id);
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create new conversation');
    }
  };

  const handleThreadClick = async (threadId: string) => {
    onThreadSelect?.(threadId);
    
    // Inspect the clicked thread
    console.log('👆 INSPECTING CLICKED THREAD...');
    await inspectSingleThread(threadId);
  };

  useEffect(() => {
    fetchThreads();
  }, [resourceId, agentId]);

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchThreads}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <button
            onClick={createNewThread}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            New Chat
          </button>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            🔍 Click any thread to inspect it in console
          </p>
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Create a new chat to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => handleThreadClick(thread.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedThreadId === thread.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {thread.title || 'Untitled Conversation'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  ID: {thread.id}
                </p>
                {thread.updatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
