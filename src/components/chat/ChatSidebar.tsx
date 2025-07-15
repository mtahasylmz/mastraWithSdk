import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2, AlertCircle, Trash2 } from "lucide-react";
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
  threads: Thread[];
  loading: boolean;
  error: string | null;
  onThreadSelect: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => Promise<boolean>;
  onRefresh: () => void;
}

const ChatSidebar = ({ 
  activeThreadId, 
  threads, 
  loading, 
  error, 
  onThreadSelect, 
  onNewThread, 
  onDeleteThread,
  onRefresh
}: ChatSidebarProps) => {
  useEffect(() => {
    
  }, [threads]);

  const handleNewThread = () => {
    onNewThread();
  };

  const handleDeleteThread = async (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      const success = await onDeleteThread(threadId);
      if (success && activeThreadId === threadId) {
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
    <Sidebar className="border-r border-gray-200 bg-gray-50">
      <SidebarHeader className="p-4 border-b border-gray-200 bg-gray-50">
        <Button
          onClick={handleNewThread}
          className="w-full h-auto py-3 px-3 rounded-2xl text-black min-h-12 flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
          style={{ backgroundColor: '#E4E3E7' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2 bg-gray-50">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-2">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to load conversations</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="mt-2 text-red-700 hover:text-red-800 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
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
              <SidebarMenu>
                {threads.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <div className="relative group">
                      <SidebarMenuButton
                        onClick={() => onThreadSelect(thread.id)}
                        isActive={activeThreadId === thread.id}
                        className={`w-full h-auto py-2 px-3 pr-12 rounded-2xl transition-all duration-200 ${
                          activeThreadId === thread.id
                            ? "text-black"
                            : "text-black"
                        }`}
                        style={activeThreadId === thread.id 
                          ? { backgroundColor: '#55BD7D' } 
                          : { backgroundColor: '#E4E3E7' }
                        }
                      >
                        <div className="flex items-start gap-3 w-full min-h-[3rem]">
                          <MessageSquare className={`h-4 w-4 mt-1.5 flex-shrink-0 ${
                            activeThreadId === thread.id 
                              ? "text-white" 
                              : "text-black"
                          }`} />
                          <div className="flex-1 min-w-0 py-0.5">
                            <p className={`text-sm font-medium truncate leading-5 mb-1 pr-2 ${
                              activeThreadId === thread.id 
                                ? "text-white" 
                                : "text-black"
                            }`}>
                              {getThreadTitle(thread)}
                            </p>
                            <div className="flex items-center justify-between pr-2">
                              <p className={`text-xs leading-4 truncate flex-1 mr-2 ${
                                activeThreadId === thread.id 
                                  ? "text-white" 
                                  : "text-black"
                              }`}>
                                {thread.metadata?.category || 'General'}
                              </p>
                              <p className={`text-xs leading-4 flex-shrink-0 ${
                                activeThreadId === thread.id 
                                  ? "text-white" 
                                  : "text-black"
                              }`}>
                                {formatDate(thread.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </SidebarMenuButton>
                      
                      <button
                        onClick={(e) => handleDeleteThread(thread.id, e)}
                        className={`absolute top-2 right-3 p-1.5 rounded opacity-20 group-hover:opacity-100 transition-opacity ${
                          activeThreadId === thread.id
                            ? "hover:bg-rose-100 hover:bg-opacity-20"
                            : "hover:bg-rose-200 hover:bg-opacity-20"
                        }`}
                        title="Delete conversation"
                      >
                        <Trash2 className={`h-3 w-3 ${
                          activeThreadId === thread.id
                            ? "text-white hover:text-red-600"
                            : "text-gray-600 hover:text-red-600"
                        }`} />
                      </button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Powered by Mastra AI • Upstash • {threads.length} conversation{threads.length !== 1 ? 's' : ''}
        </p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;