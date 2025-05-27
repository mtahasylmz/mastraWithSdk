import { useState, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { Button } from "@/components/ui/button";
import { Menu, AlertCircle } from "lucide-react";
import { useMessages, useMessageStream, UIMessage } from "@/hooks";

const ChatInterface = () => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { messages, loading: messagesLoading, error: messagesError, fetchMessages, clearMessages } = useMessages();
  const { isStreaming, streamingMessage, error: streamError, sendMessage, clearStreamingMessage } = useMessageStream();

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
    // The thread creation is handled in ChatSidebar
    // This callback is for any additional UI updates if needed
    console.log('New thread created');
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) {
      console.warn('No active thread selected');
      return;
    }

    try {
      // Send message with streaming and refresh messages when complete
      await sendMessage(content, activeThreadId, () => {
        console.log('🔄 Streaming complete, refreshing messages...');
        fetchMessages(activeThreadId);
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getCurrentThreadTitle = () => {
    // This could be enhanced to get thread details from the hook
    return activeThreadId ? `Thread ${activeThreadId.slice(-8)}` : "Chat";
  };

  // Combine regular messages with streaming message for display
  const allMessages = streamingMessage 
    ? [...messages, streamingMessage as UIMessage] 
    : messages;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <ChatSidebar
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {getCurrentThreadTitle()}
            </h1>
            {activeThreadId && (
              <p className="text-sm text-gray-500">
                Powered by Mastra AI • Article Research Agent
                {isStreaming && " • Generating response..."}
              </p>
            )}
          </div>
          
          {(messagesError || streamError) && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {messagesError || streamError}
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
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
                  messages={allMessages} 
                  isLoading={isStreaming}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to Mastra AI Chat
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
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
        </div>

        {/* Input */}
        {activeThreadId && (
          <div className="bg-white border-t border-gray-200 p-4">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isStreaming} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;