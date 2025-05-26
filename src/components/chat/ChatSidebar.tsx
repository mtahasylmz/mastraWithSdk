import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare } from "lucide-react";

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

interface ChatSidebarProps {
  threads: Thread[];
  activeThreadId: string;
  onThreadSelect: (id: string) => void;
  onNewThread: () => void;
}

const ChatSidebar = ({ threads, activeThreadId, onThreadSelect, onNewThread }: ChatSidebarProps) => {
  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={onNewThread}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeThreadId === thread.id
                  ? "bg-gray-700 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{thread.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {thread.messages.length} messages
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Chat Interface v1.0
        </p>
      </div>
    </div>
  );
};

export default ChatSidebar;