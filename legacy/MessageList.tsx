'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface MessagePart {
  type: string;
  text?: string;
  reasoning?: string;
  toolInvocation?: any;
  [key: string]: any;
}

interface UIMessage {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  createdAt?: Date;
  reasoning?: string;
  annotations?: any[];
  toolInvocations?: Array<any>;
  parts?: Array<MessagePart>;
  experimental_attachments?: any[];
  data?: any;
}

interface MessageListProps {
  messages: UIMessage[];
}

function MessageBubble({ message, isLast }: { message: UIMessage; isLast: boolean }) {
  const [showActions, setShowActions] = useState(false);

  const renderMessageContent = () => {
    // If message has parts, render them
    if (message.parts && message.parts.length > 0) {
      return (
        <div className="space-y-3">
          {message.parts.map((part, index) => (
            <div key={index}>
              {part.type === 'text' && (
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{part.text}</p>
                </div>
              )}
              
              {part.type === 'reasoning' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                  <div className="text-sm font-medium text-amber-800 mb-2">🧠 AI Reasoning</div>
                  <div className="text-sm text-amber-700 whitespace-pre-wrap">
                    {part.reasoning}
                  </div>
                </div>
              )}
              
              {part.type === 'tool-invocation' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                  <div className="text-sm font-medium text-blue-800 mb-2">🔧 Tool Usage</div>
                  <pre className="text-xs text-blue-700 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(part.toolInvocation, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Fallback to content
    return (
      <div className="prose prose-gray max-w-none">
        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{message.content}</p>
      </div>
    );
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div 
      className={`group px-4 py-6 ${message.role === 'assistant' ? 'bg-gray-50' : 'bg-white'} hover:bg-opacity-80 transition-colors`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className={`w-8 h-8 ${
              message.role === 'user' 
                ? 'bg-purple-600' 
                : 'bg-green-600'
            }`}>
              <AvatarFallback className="text-white text-sm font-medium">
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900">
                {message.role === 'user' ? 'You' : 'Academic Research Assistant'}
              </span>
              {message.createdAt && (
                <span className="text-xs text-gray-500 ml-2">
                  {formatTime(message.createdAt)}
                </span>
              )}
            </div>
            
            <div className="text-gray-800">
              {renderMessageContent()}
            </div>

            {/* Tool Invocations */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-gray-700">Used Tools:</div>
                {message.toolInvocations.map((tool, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <pre className="text-xs text-blue-700 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(tool, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Message Actions */}
            {message.role === 'assistant' && (showActions || isLast) && (
              <div className="flex items-center gap-1 mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-7 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Like
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Dislike
                </Button>
                {isLast && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages }: MessageListProps) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-gray-100">
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isLast={index === messages.length - 1}
        />
      ))}
    </div>
  );
} 