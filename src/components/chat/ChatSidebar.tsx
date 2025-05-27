import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useThreads } from "@/hooks/useThreads";
import { useEffect } from "react";

interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ChatSidebarProps {
  activeThreadId: string | null;
  onThreadSelect: (id: string) => void;
  onNewThread: () => void;
}

const ChatSidebar = ({ activeThreadId, onThreadSelect, onNewThread }: ChatSidebarProps) => {
  const { threads, loading, error, createThread, deleteThread, refreshThreads } = useThreads();

  // Debug logging for threads changes
  useEffect(() => {
    console.log('🎨 ChatSidebar: threads updated, count:', threads.length);
    console.log('🎨 ChatSidebar: threads data:', threads.map(t => ({ id: t.id, title: t.title })));
  }, [threads]);

  const handleNewThread = async () => {
    console.log('🎯 ChatSidebar: handleNewThread called');
    const newThread = await createThread();
    console.log('🎯 ChatSidebar: createThread returned:', newThread);
    if (newThread) {
      console.log('🎯 ChatSidebar: Selecting new thread:', newThread.id);
      onThreadSelect(newThread.id);
      onNewThread(); // Call the parent callback
    } else {
      console.log('❌ ChatSidebar: Failed to create thread');
    }
  };

  const handleDeleteThread = async (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent thread selection
    if (confirm('Are you sure you want to delete this conversation?')) {
      const success = await deleteThread(threadId);
      if (success && activeThreadId === threadId) {
        // If deleted thread was active, clear selection
        onThreadSelect('');
      }
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getThreadTitle = (thread: Thread) => {
    return thread.title || 'Untitled Conversation';
  };

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={handleNewThread}
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          New Chat
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border-b border-red-700">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load conversations</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshThreads}
            className="mt-2 text-red-300 hover:text-red-200"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Threads List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {loading && threads.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-400">Loading conversations...</span>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative rounded-lg transition-colors ${
                  activeThreadId === thread.id
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <button
                  onClick={() => onThreadSelect(thread.id)}
                  className="w-full text-left p-3 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getThreadTitle(thread)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          {thread.metadata?.category || 'General'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(thread.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Delete button - shows on hover */}
                <button
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Powered by Mastra AI • {threads.length} conversation{threads.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default ChatSidebar;