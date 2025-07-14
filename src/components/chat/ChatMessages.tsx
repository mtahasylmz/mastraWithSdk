import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Loader2, Code, Lightbulb, Wrench } from "lucide-react";
import { UIMessage } from "@/hooks/useMessages";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export interface ChatMessagesRef {
  scrollToBottom: () => void;
}

const ChatMessages = forwardRef<ChatMessagesRef, ChatMessagesProps>(({ messages, isLoading }, ref) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    console.log('📜 scrollToBottom called', {
      hasScrollArea: !!scrollAreaRef.current,
      scrollTop: scrollAreaRef.current?.scrollTop,
      scrollHeight: scrollAreaRef.current?.scrollHeight,
      clientHeight: scrollAreaRef.current?.clientHeight
    });
    
    if (scrollAreaRef.current) {
      // Try to find the actual scrollable viewport (RadixUI ScrollArea has a nested structure)
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      const targetElement = viewport || scrollAreaRef.current;
      
      console.log('📜 Target element:', {
        isViewport: !!viewport,
        scrollTop: targetElement.scrollTop,
        scrollHeight: targetElement.scrollHeight
      });
      
      targetElement.scrollTop = targetElement.scrollHeight;
      
      // Log after scroll attempt
      setTimeout(() => {
        console.log('📜 After scroll attempt:', {
          scrollTop: targetElement.scrollTop,
          scrollHeight: targetElement.scrollHeight
        });
      }, 10);
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToBottom
  }));

  // Only scroll on initial load or when component first mounts
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      // Check if this is the first render with messages
      const shouldScroll = messages.length === 1 || 
        (messages.length > 1 && !messages.some(msg => (msg as any).isStreaming));
      
      if (shouldScroll) {
        scrollToBottom();
      }
    }
  }, [messages.length]); // Only depend on length, not content changes

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
    const isStreaming = (message as any).isStreaming;
    
    // 🔥 FIXED: For streaming messages, just show the accumulated content
    if (isStreaming) {
      return (
        <div>
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Generating response...</span>
            </div>
          )}
        </div>
      );
    }
    
    // 🔥 FIXED: For completed messages, collect text parts and render non-text parts separately
    if (message.parts && message.parts.length > 0) {
      // Collect all text parts into one continuous string to avoid div wrapping
      const textParts = message.parts.filter(part => part.type === 'text');
      const nonTextParts = message.parts.filter(part => part.type !== 'text');
      
      return (
        <>
          {/* 🔥 FIXED: Render all text as markdown */}
          {textParts.length > 0 && (
            <MarkdownRenderer 
              content={textParts.map(part => part.text).join('')}
            />

          )}
          
          {/* Render non-text parts with their special formatting */}
          {nonTextParts.map((part, index) => {
            switch (part.type) {
              
              case 'tool-invocation':
                return (
                  <div key={index} className="mt-3 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-emerald-700" />
                      <span className="text-sm font-medium text-emerald-700">
                        The {part.toolInvocation?.toolName || 'unknown'} tool is called
                      </span>
                    </div>
                  </div>
                );
              
            }
          })}
        </>
      );
    }

    // Fallback to content if no parts
    return (
      <MarkdownRenderer content={message.content} />
    );
  };

  const renderMessage = (message: UIMessage) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isStreaming = (message as any).isStreaming;
    
    return (
      <div
        key={message.id}
        className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} ${
          isSystem ? "opacity-70" : ""
        }`}
      >
        {!isUser && (
          <Avatar className="w-8 h-8 flex-shrink-0 ">
            <AvatarFallback className={isSystem ? "bg-gray-100" : "bg-emerald-100"}>
              {isSystem ? (
                <Code className="h-4 w-4 text-gray-600" />
              ) : isStreaming ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 text-emerald-600 " />
              )}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex-1 max-w-[70%] ${isUser ? "order-first" : ""}`}>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? "text-black"
                : isSystem
                ? "bg-gray-100 border border-gray-200 text-gray-700"
                : "bg-white border border-gray-200 text-gray-900"
            }`}
            style={isUser ? { backgroundColor: '#E4E3E7' } : {}}
          >
            <div className="text-sm leading-relaxed">
              {renderMessageContent(message)}
            </div>
            
            {/* Show standalone reasoning if not in parts and not streaming */}
            {!isStreaming && message.reasoning && (!message.parts || message.parts.length === 0) && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs italic text-blue-700">
                <strong>Reasoning:</strong>
                <MarkdownRenderer content={message.reasoning} className="mt-1" />
              </div>
            )}
            
            {/* Show tool invocations if not in parts */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (!message.parts || message.parts.length === 0) && (
              <div className="mt-3 space-y-2">
                {message.toolInvocations.map((tool, index) => (
                  <div key={index} className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-emerald-700" />
                      <span className="text-sm font-medium text-emerald-700">
                        The {tool.toolName || 'unknown'} tool is called
                      </span>
                    </div>
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

  // Filter out duplicate streaming messages that appear after refresh
  const hasStreamingMessage = messages.some(msg => (msg as any).isStreaming);

  return (
    <ScrollArea 
      className="h-full p-4" 
      ref={scrollAreaRef}
      style={{ backgroundColor: 'rgba(228, 227, 231, 0.25)' }}
    >
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

        {/* Only show loading bubble if not streaming and isLoading is true */}
        {isLoading && !hasStreamingMessage && (
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
});

export default ChatMessages;