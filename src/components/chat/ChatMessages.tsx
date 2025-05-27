import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Loader2, Code, Lightbulb, Wrench } from "lucide-react";
import { UIMessage } from "@/hooks/useMessages";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the conversion resulted in a valid date
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (message: UIMessage) => {
    // If message has parts, render them individually
    if (message.parts && message.parts.length > 0) {
      return message.parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return (
              <div key={index} className="whitespace-pre-wrap">
                {part.text}
              </div>
            );
          
          case 'reasoning':
            return (
              <div key={index} className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Reasoning
                  </span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                  {part.reasoning}
                </p>
              </div>
            );
          
          case 'tool-invocation':
            return (
              <div key={index} className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Tool Used
                  </span>
                </div>
                <pre className="text-xs text-amber-800 dark:text-amber-200 overflow-x-auto bg-amber-100 dark:bg-amber-900/40 p-2 rounded">
                  {JSON.stringify(part.toolInvocation, null, 2)}
                </pre>
              </div>
            );
          
          case 'source':
            return (
              <div key={index} className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Source
                  </span>
                </div>
                <pre className="text-xs text-green-800 dark:text-green-200 overflow-x-auto bg-green-100 dark:bg-green-900/40 p-2 rounded">
                  {JSON.stringify(part.source, null, 2)}
                </pre>
              </div>
            );
          
          case 'file':
            return (
              <div key={index} className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    File ({part.mimeType})
                  </span>
                </div>
                <div className="text-xs text-purple-800 dark:text-purple-200">
                  {part.data ? 'File data available' : 'No file data'}
                </div>
              </div>
            );
          
          default:
            return (
              <div key={index} className="mt-2 text-sm text-gray-500">
                <strong>Unknown part type:</strong> {part.type}
              </div>
            );
        }
      });
    }

    // Fallback to content if no parts
    return (
      <div className="whitespace-pre-wrap">
        {message.content}
      </div>
    );
  };

  const renderMessage = (message: UIMessage) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isStreaming = (message as any).isStreaming; // Check if message is streaming
    
    return (
      <div
        key={message.id}
        className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} ${
          isSystem ? "opacity-70" : ""
        }`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className={isSystem ? "bg-gray-100" : "bg-blue-100"}>
              {isSystem ? (
                <Code className="h-4 w-4 text-gray-600" />
              ) : isStreaming ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 text-blue-600" />
              )}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? "bg-blue-600 text-white"
                : isSystem
                ? "bg-gray-100 border border-gray-200 text-gray-700"
                : isStreaming
                ? "bg-blue-50 border border-blue-200 text-gray-900"
                : "bg-white border border-gray-200 text-gray-900"
            }`}
          >
            <div className="text-sm leading-relaxed">
              {renderMessageContent(message)}
              {isStreaming && message.content === '' && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Generating response...</span>
                </div>
              )}
            </div>
            
            {/* Show standalone reasoning if not in parts */}
            {message.reasoning && (!message.parts || message.parts.length === 0) && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs italic text-blue-700">
                <strong>Reasoning:</strong> {message.reasoning}
              </div>
            )}
            
            {/* Show tool invocations if not in parts */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (!message.parts || message.parts.length === 0) && (
              <div className="mt-3 space-y-2">
                {message.toolInvocations.map((tool, index) => (
                  <div key={index} className="p-2 bg-amber-50 rounded text-xs">
                    <strong>Tool:</strong> {JSON.stringify(tool)}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
            isUser ? "justify-end" : "justify-start"
          }`}>
            <span>{formatTime(message.createdAt)}</span>
            {message.role === 'system' && (
              <span className="text-gray-400">• System</span>
            )}
            {isStreaming && (
              <span className="text-blue-500">• Streaming</span>
            )}
          </div>
        </div>

        {isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-gray-100">
              <User className="h-4 w-4 text-gray-600" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500">
              Send a message to begin your chat with the AI assistant.
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-100">
                <Bot className="h-4 w-4 text-blue-600" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <p className="text-sm text-gray-500">AI is thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;