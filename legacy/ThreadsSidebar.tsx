'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, Search, MoreHorizontal, Edit3 } from 'lucide-react';

interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ThreadsSidebarProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onCreateThread: (title?: string) => void;
  onDeleteThread: (threadId: string) => void;
  loading: boolean;
}

export function ThreadsSidebar({
  threads,
  selectedThreadId,
  onThreadSelect,
  onCreateThread,
  onDeleteThread,
  loading
}: ThreadsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter threads based on search query
  const filteredThreads = threads.filter(thread =>
    thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return d.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={() => onCreateThread()}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 justify-start gap-3 h-11"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
          />
        </div>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1 px-2">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => onCreateThread()} 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:bg-gray-800"
              >
                Start your first chat
              </Button>
            )}
          </div>
        ) : (
          <div className="py-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative rounded-lg mx-2 my-1 cursor-pointer transition-all duration-200 ${
                  selectedThreadId === thread.id 
                    ? 'bg-gray-800' 
                    : 'hover:bg-gray-800/60'
                }`}
                onClick={() => onThreadSelect(thread.id)}
              >
                <div className="flex items-center p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-white truncate">
                        {thread.title || 'New Chat'}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(thread.updatedAt || thread.createdAt)}
                    </p>
                  </div>
                  
                  {/* Action buttons (show on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement edit functionality
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
          <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">User</div>
            <div className="text-xs text-gray-400">Free plan</div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
} 