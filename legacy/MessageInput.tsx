'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Loader2, Mic } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Message..." 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() || disabled || isSending) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="p-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-white border border-gray-200 rounded-3xl shadow-sm focus-within:border-gray-300 focus-within:shadow-md transition-all">
          <div className="flex items-end p-3 gap-3">
            {/* Attachment button */}
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Message input area */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={disabled ? "Please wait..." : placeholder}
                disabled={disabled || isSending}
                className="min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-gray-900 placeholder-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />
            </div>

            {/* Voice and Send buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!message.trim() ? (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!message.trim() || disabled || isSending}
                  size="icon"
                  className="h-8 w-8 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500 text-center mt-3">
          ChatGPT can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
} 