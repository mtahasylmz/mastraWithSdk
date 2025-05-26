'use client';

import React, { useState, useEffect } from 'react';
import { ThreadsSidebar } from './ThreadsSidebar';
import { ChatArea } from './ChatArea';
import { mastra_sdk } from '@/lib/mastraClient';

interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function ChatLayout() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resourceId = "user-123";
  const agentId = "articleAgent";

  // Fetch all threads
  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await mastra_sdk.getMemoryThreads({
        resourceId,
        agentId,
      });
      setThreads(response || []);
      
      // Auto-select first thread if available
      if (response && response.length > 0 && !selectedThreadId) {
        setSelectedThreadId(response[0].id);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new thread
  const createThread = async (title: string = "New Conversation") => {
    try {
      const newThread = await mastra_sdk.createMemoryThread({
        threadId: `thread_${Date.now()}`,
        title,
        metadata: { category: "general" },
        resourceId,
        agentId,
      });
      
      if (newThread) {
        setThreads(prev => [newThread, ...prev]);
        setSelectedThreadId(newThread.id);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  // Delete thread
  const deleteThread = async (threadId: string) => {
    try {
      const thread = await mastra_sdk.getMemoryThread(threadId, agentId);
      await thread.delete();
      
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      // If deleted thread was selected, select another one
      if (selectedThreadId === threadId) {
        const remainingThreads = threads.filter(t => t.id !== threadId);
        setSelectedThreadId(remainingThreads.length > 0 ? remainingThreads[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Dark Sidebar */}
      <div className="w-80 bg-gray-900 text-white flex-shrink-0">
        <ThreadsSidebar
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadSelect={setSelectedThreadId}
          onCreateThread={createThread}
          onDeleteThread={deleteThread}
          loading={loading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          selectedThreadId={selectedThreadId}
          agentId={agentId}
        />
      </div>
    </div>
  );
} 