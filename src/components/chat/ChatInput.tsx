import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex gap-4 items-end bg-white border border-black rounded-2xl p-4 hover:border-emerald-500 focus-within:border-emerald-700 focus-within:border-2 transition-colors duration-200">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message with your agent..."
              className="flex-1 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 min-h-[24px] max-h-[200px]"
              disabled={disabled}
              rows={1}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || disabled}
              className="bg-black hover:bg-gray-800 text-white rounded-full flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>
    </div>
  );
};

export default ChatInput;