import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const ChatInterface = () => {
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "1",
      title: "Getting Started with AI",
      messages: [
        {
          id: "1",
          content: "Hello! How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ]);
  
  const [activeThreadId, setActiveThreadId] = useState<string>("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const activeThread = threads.find(thread => thread.id === activeThreadId);

  const handleSendMessage = async (content: string) => {
    if (!activeThread) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    // Add user message
    setThreads(prev => prev.map(thread => 
      thread.id === activeThreadId 
        ? { ...thread, messages: [...thread.messages, newMessage] }
        : thread
    ));

    setIsLoading(true);

    // Simulate AI response (replace with your SDK call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your message. This is where you'd integrate your AI SDK to get the actual response.",
        role: "assistant",
        timestamp: new Date(),
      };

      setThreads(prev => prev.map(thread => 
        thread.id === activeThreadId 
          ? { ...thread, messages: [...thread.messages, aiResponse] }
          : thread
      ));
      
      setIsLoading(false);
    }, 1000);
  };

  const handleNewThread = () => {
    const newThread: Thread = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <ChatSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onThreadSelect={setActiveThreadId}
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
          <h1 className="text-lg font-semibold text-gray-900">
            {activeThread?.title || "Chat"}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages 
            messages={activeThread?.messages || []} 
            isLoading={isLoading}
          />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;