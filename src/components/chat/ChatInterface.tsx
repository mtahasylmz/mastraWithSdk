import { useEffect, useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ChatSidebar from "./ChatSidebar";
import ChatMessages, { ChatMessagesRef } from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useThreads } from "@/hooks/useThreads";
import { useMessages } from "@/hooks/useMessages";
import { useMessageStream, UIMessage } from "@/hooks";
import { Button } from "@/components/ui/button";

const ChatInterface = () => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newlyCreatedThreads, setNewlyCreatedThreads] = useState<Set<string>>(new Set());
  const chatMessagesRef = useRef<ChatMessagesRef>(null);

  const { messages, loading: messagesLoading, error: messagesError, fetchMessages, clearMessages, addMessage, appendStreamedMessage } = useMessages();
  const { isStreaming, streamingMessage, error: streamError, sendMessage, clearStreamingMessage } = useMessageStream();
  const { threads, loading: threadsLoading, error: threadsError, fetchThreads, generateThreadId, deleteThread } = useThreads();

  // Fetch messages when thread changes
  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
      clearStreamingMessage(); // Clear any previous streaming message
    } else {
      clearMessages();
      clearStreamingMessage();
    }
  }, [activeThreadId, fetchMessages, clearMessages, clearStreamingMessage]);

  const handleThreadSelect = (threadId: string) => {
    if (threadId === '') {
      // Handle empty thread selection (e.g., when thread is deleted)
      setActiveThreadId(null);
    } else {
      setActiveThreadId(threadId);
    }
  };

  const handleNewThread = () => {
    // 🔥 IMPROVED: Generate thread ID at ChatInterface level for better state management
    const newThreadId = generateThreadId();
    console.log('🆕 ChatInterface: New thread created:', newThreadId);
    
    // Track this as a newly created thread
    setNewlyCreatedThreads(prev => new Set(prev).add(newThreadId));
    
    // Immediately set as active thread - will auto-create on first message
    setActiveThreadId(newThreadId);
    clearMessages(); // Clear messages for new conversation
    clearStreamingMessage();
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) {
      console.warn('No active thread selected');
      return;
    }

    console.log('📤 ChatInterface: Sending message to thread:', activeThreadId);

    // 🔥 INCREMENTAL: Immediately add user message to UI for instant feedback
    const userMessage: UIMessage = {
      id: `user_${Date.now()}`,
      content,
      role: 'user',
      createdAt: new Date(),
    };

    // Add user message immediately to messages state
    addMessage(userMessage);
    
    // Scroll to bottom after user message is added with increased delay
    setTimeout(() => {
      console.log('🔄 Attempting to scroll after user message...', {
        hasRef: !!chatMessagesRef.current,
        scrollFunction: typeof chatMessagesRef.current?.scrollToBottom
      });
      chatMessagesRef.current?.scrollToBottom();
    }, 200); // Increased delay to ensure DOM update

    try {
      // 🔥 IMPROVED: Send message with streaming and use incremental updates
      await sendMessage(content, activeThreadId, async (assistantMessage: UIMessage) => {
        console.log('🔄 Stream complete, appending assistant message incrementally...');
        
        // 🔥 NEW: Append the assistant message incrementally (no full refetch!)
        appendStreamedMessage(assistantMessage);
        
        // Clear streaming message AFTER adding the real message
        setTimeout(() => {
          clearStreamingMessage();
        }, 100); // Small delay to ensure UI updates smoothly
        
        // 🔥 IMPROVED: Only refresh thread list if this is a newly created thread
        if (newlyCreatedThreads.has(activeThreadId)) {
          console.log('🔄 Refreshing thread list for newly auto-created thread:', activeThreadId);
          
          // Small delay to ensure server operations are complete
          setTimeout(async () => {
            await fetchThreads();
            
            // Remove from newly created set since it's now persisted
            setNewlyCreatedThreads(prev => {
              const updated = new Set(prev);
              updated.delete(activeThreadId);
              return updated;
            });
          }, 1000);
        }
        
        console.log('✅ Incremental message update completed - no full refetch!');
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getCurrentThreadTitle = () => {
    if (!activeThreadId) return "Chat";
    
    const currentThread = threads.find(thread => thread.id === activeThreadId);
    return currentThread?.title || "Untitled Conversation";
  };

  // Combine regular messages with streaming message for display
  // If we have a streaming message, check if we already have a similar real message to avoid duplicates
  const allMessages = streamingMessage && streamingMessage.isStreaming
    ? [...messages, streamingMessage as UIMessage] 
    : messages;

  // 🔥 DEBUG: Log the message combination
  console.log('🎬 ChatInterface render:', {
    messagesCount: messages.length,
    hasStreamingMessage: !!streamingMessage,
    isStreamingActive: streamingMessage?.isStreaming,
    allMessagesCount: allMessages.length,
    streamingContent: streamingMessage?.content,
    streamingContentLength: streamingMessage?.content?.length || 0,
    // 🔥 NEW: More detailed debugging
    streamingId: streamingMessage?.id,
    streamingPartsCount: streamingMessage?.parts?.length || 0
  });

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && streamingMessage?.content) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        chatMessagesRef.current?.scrollToBottom();
      }, 50);
    }
  }, [isStreaming, streamingMessage?.content?.length]);

  // Auto-scroll when streaming starts (when assistant message first appears)
  useEffect(() => {
    if (isStreaming && streamingMessage) {
      // Scroll when streaming first starts
      setTimeout(() => {
        chatMessagesRef.current?.scrollToBottom();
      }, 100);
    }
  }, [isStreaming, streamingMessage?.id]); // Trigger when streaming message ID changes (new message starts)

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        {/* Sidebar */}
        <ChatSidebar
          activeThreadId={activeThreadId}
          threads={threads}
          loading={threadsLoading}
          error={threadsError}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
          onDeleteThread={deleteThread}
          onRefresh={fetchThreads}
        />

        {/* Main Chat Area */}
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 min-h-16">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {getCurrentThreadTitle()}
              </h1>
              {activeThreadId && (
                <p className="text-sm text-gray-500 truncate">
                  Powered by Mastra AI & Upstash • Article Research Agent
                  {isStreaming && " • Generating response..."}
                  {/* 🔥 NEW: Show streaming content length for debugging */}
                  {isStreaming && streamingMessage?.content && 
                    ` • ${streamingMessage.content.length} chars`}
                </p>
              )}
            </div>
            
            {(messagesError || streamError) && (
              <div className="flex items-center gap-2 text-red-600 flex-shrink-0">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {messagesError || streamError}
                </span>
              </div>
            )}
          </header>

          {/* Messages */}
          <main className="flex-1 overflow-hidden">
            {activeThreadId ? (
              <>
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading conversation...</p>
                    </div>
                  </div>
                ) : (
                  <ChatMessages 
                    ref={chatMessagesRef}
                    messages={allMessages} 
                    isLoading={isStreaming}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Welcome to Mastra AI Chat
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Select an existing conversation or start a new one to begin chatting 
                    with the AI research assistant.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p><strong>Features:</strong></p>
                    <ul className="mt-2 space-y-1">
                      <li>• Article research and summarization</li>
                      <li>• Academic paper recommendations</li>
                      <li>• Conversation memory and context</li>
                      <li>• Tool-enhanced responses with real-time streaming</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Input */}
          {activeThreadId && (
            <footer className="bg-white border-t border-gray-200 p-4">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isStreaming} 
              />
            </footer>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ChatInterface;