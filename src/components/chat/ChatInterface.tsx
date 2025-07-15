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

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
      clearStreamingMessage();
    } else {
      clearMessages();
      clearStreamingMessage();
    }
  }, [activeThreadId, fetchMessages, clearMessages, clearStreamingMessage]);

  const handleThreadSelect = (threadId: string) => {
    if (threadId === '') {
      setActiveThreadId(null);
    } else {
      setActiveThreadId(threadId);
    }
  };

  const handleNewThread = () => {
    const newThreadId = generateThreadId();
    
    setNewlyCreatedThreads(prev => new Set(prev).add(newThreadId));
    
    setActiveThreadId(newThreadId);
    clearMessages();
    clearStreamingMessage();
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) {
      return;
    }

    const userMessage: UIMessage = {
      id: `user_${Date.now()}`,
      content,
      role: 'user',
      createdAt: new Date(),
    };

    addMessage(userMessage);
    
    setTimeout(() => {
      chatMessagesRef.current?.scrollToBottom();
    }, 200);

    try {
      await sendMessage(content, activeThreadId, async (assistantMessage: UIMessage) => {
        
        appendStreamedMessage(assistantMessage);
        
        setTimeout(() => {
          clearStreamingMessage();
        }, 100);
        
        if (newlyCreatedThreads.has(activeThreadId)) {
          
          setTimeout(async () => {
            await fetchThreads();
            
            setNewlyCreatedThreads(prev => {
              const updated = new Set(prev);
              updated.delete(activeThreadId);
              return updated;
            });
          }, 1500);
        }
        
      });
    } catch (error) {
      
    }
  };

  const getCurrentThreadTitle = () => {
    if (!activeThreadId) return "Chat";
    
    const currentThread = threads.find(thread => thread.id === activeThreadId);
    return currentThread?.title || "Untitled Conversation";
  };

  const allMessages = streamingMessage && streamingMessage.isStreaming
    ? [...messages, streamingMessage as UIMessage] 
    : messages;

  useEffect(() => {
    if (isStreaming && streamingMessage?.content) {
      setTimeout(() => {
        chatMessagesRef.current?.scrollToBottom();
      }, 50);
    }
  }, [isStreaming, streamingMessage?.content?.length]);

  useEffect(() => {
    if (isStreaming && streamingMessage) {
      setTimeout(() => {
        chatMessagesRef.current?.scrollToBottom();
      }, 100);
    }
  }, [isStreaming, streamingMessage?.id]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
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

        <SidebarInset className="flex-1 flex flex-col min-w-0">
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