# Mastra Client SDK Documentation

## Overview

The Mastra Client SDK (`@mastra/client-js`) provides a comprehensive interface for interacting with Mastra framework services, including memory management, thread operations, and message handling.

## Installation

```bash
npm install @mastra/client-js
```

## Basic Setup

### Client Initialization

```typescript
import { MastraClient } from "@mastra/client-js";

export const mastra_sdk = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API || "http://localhost:4111",
  retries: 3,
});
```

**Configuration Options:**
- `baseUrl`: The URL of your Mastra server (default: http://localhost:4111)
- `retries`: Number of retry attempts for failed requests (default: 3)

## Memory & Thread Management

### Core Concepts

- **Resource ID**: Identifies the user or context (e.g., `"user-123"`, `"articleAgent"`)
- **Agent ID**: Identifies the specific agent (e.g., `"articleAgent"`)
- **Thread ID**: Unique identifier for conversation threads

### Thread Operations

#### 1. List All Threads

```typescript
const threads = await mastra_sdk.getMemoryThreads({
  resourceId: "user-123",
  agentId: "articleAgent",
});

// Returns: Array of thread objects
console.log(threads); // [{ id, title, metadata, createdAt, updatedAt }, ...]
```

#### 2. Create New Thread

```typescript
const newThread = await mastra_sdk.createMemoryThread({
  threadId: `thread_${Date.now()}`, // Generate unique ID
  title: "New Conversation",
  metadata: { category: "general", topic: "research" },
  resourceId: "user-123",
  agentId: "articleAgent",
});

// Returns: Thread object with created thread details
```

#### 3. Get Single Thread Object

```typescript
const thread = await mastra_sdk.getMemoryThread(threadId, agentId);

// Returns: MemoryThread instance with methods
// - thread.get(): Get thread details
// - thread.update(params): Update thread
// - thread.delete(): Delete thread
// - thread.getMessages(params?): Get messages
```

## MemoryThread Class

The `getMemoryThread()` method returns a `MemoryThread` instance with the following methods:

### Thread Details

```typescript
// Get thread information
const threadDetails = await thread.get();
// Returns: { id, title, metadata, createdAt, updatedAt, ... }
```

### Update Thread

```typescript
const updatedThread = await thread.update({
  title: "Updated Title",
  metadata: { category: "updated", status: "active" }
});
```

### Delete Thread

```typescript
const result = await thread.delete();
// Returns: { result: "success" }
```

### Get Messages

```typescript
const messagesResponse = await thread.getMessages();
// Optional parameters:
const limitedMessages = await thread.getMessages({ limit: 10 });
```

## Message Structure

### GetMemoryThreadMessagesResponse

```typescript
interface GetMemoryThreadMessagesResponse {
  messages: CoreMessage[];     // Raw messages from the system
  uiMessages: UIMessage[];     // UI-optimized messages for display
}
```

### UI Message Format

```typescript
interface UIMessage {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  createdAt?: Date;
  reasoning?: string;
  annotations?: any[];
  toolInvocations?: Array<ToolInvocation>;
  parts?: Array<MessagePart>;
  experimental_attachments?: any[];
  data?: any;
}
```

### Message Parts

Messages can contain different types of parts:

```typescript
type MessagePart = 
  | { type: 'text'; text: string }
  | { type: 'reasoning'; reasoning: string }
  | { type: 'tool-invocation'; toolInvocation: any }
  | { type: 'source'; source: any }
  | { type: 'file'; mimeType: string; data: string }
  | { type: 'step-start' };
```

## Complete Implementation Example

### Thread Management Component

```typescript
import React, { useState, useEffect } from 'react';
import { mastra_sdk } from '@/lib/mastraClient';

interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ThreadManager: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const resourceId = "user-123";
  const agentId = "articleAgent";

  // Fetch all threads
  const fetchThreads = async () => {
    try {
      const response = await mastra_sdk.getMemoryThreads({
        resourceId,
        agentId,
      });
      setThreads(response || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  // Create new thread
  const createThread = async () => {
    try {
      const newThread = await mastra_sdk.createMemoryThread({
        threadId: `thread_${Date.now()}`,
        title: "New Conversation",
        metadata: { category: "general" },
        resourceId,
        agentId,
      });
      
      if (newThread) {
        setThreads(prev => [newThread, ...prev]);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  // Fetch messages for selected thread
  const fetchMessages = async (threadId: string) => {
    try {
      const thread = await mastra_sdk.getMemoryThread(threadId, agentId);
      const messagesResponse = await thread.getMessages();
      
      // Use uiMessages for display (preferred)
      if (messagesResponse.uiMessages) {
        setMessages(messagesResponse.uiMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle thread selection
  const handleThreadSelect = (threadId: string) => {
    setSelectedThread(threadId);
    fetchMessages(threadId);
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  return (
    <div className="thread-manager">
      {/* Thread List */}
      <div className="thread-list">
        <button onClick={createThread}>New Thread</button>
        {threads.map(thread => (
          <div 
            key={thread.id}
            onClick={() => handleThreadSelect(thread.id)}
            className={selectedThread === thread.id ? 'selected' : ''}
          >
            {thread.title || 'Untitled'}
          </div>
        ))}
      </div>

      {/* Messages Display */}
      <div className="messages">
        {messages.map((message, index) => (
          <div key={message.id || index} className={`message ${message.role}`}>
            <strong>{message.role}:</strong>
            {message.parts ? (
              message.parts.map((part: any, partIndex: number) => (
                <div key={partIndex}>
                  {part.type === 'text' && <p>{part.text}</p>}
                  {part.type === 'reasoning' && (
                    <div className="reasoning">
                      <strong>Reasoning:</strong> {part.reasoning}
                    </div>
                  )}
                  {part.type === 'tool-invocation' && (
                    <div className="tool-invocation">
                      <strong>Tool:</strong> {JSON.stringify(part.toolInvocation)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadManager;
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const thread = await mastra_sdk.getMemoryThread(threadId, agentId);
  const messages = await thread.getMessages();
} catch (error) {
  if (error.status === 404) {
    console.error('Thread not found');
  } else if (error.status === 401) {
    console.error('Unauthorized access');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Validation Checks

```typescript
// Check if thread object has required methods
if (thread && typeof thread.getMessages === 'function') {
  const messages = await thread.getMessages();
} else {
  console.error('Invalid thread object or missing getMessages method');
}

// Validate message response structure
if (messagesResponse && messagesResponse.uiMessages) {
  setMessages(messagesResponse.uiMessages);
} else {
  console.warn('No UI messages found in response');
}
```

## Best Practices

### 1. Environment Configuration

```typescript
// Use environment variables for configuration
const mastra_sdk = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API || "http://localhost:4111",
  retries: parseInt(process.env.MASTRA_RETRIES || "3"),
});
```

### 2. Resource & Agent ID Management

```typescript
// Centralize ID management
const CONFIG = {
  resourceId: process.env.NEXT_PUBLIC_RESOURCE_ID || 'default-user',
  agentId: 'articleAgent', // Should match your agent configuration
};
```

### 3. Message Rendering

```typescript
// Prefer uiMessages for display
const renderMessage = (message: UIMessage) => {
  // Handle parts-based rendering for rich content
  if (message.parts && message.parts.length > 0) {
    return message.parts.map(part => {
      switch (part.type) {
        case 'text':
          return <div>{part.text}</div>;
        case 'reasoning':
          return <div className="reasoning">{part.reasoning}</div>;
        case 'tool-invocation':
          return <div className="tool">{JSON.stringify(part.toolInvocation)}</div>;
        default:
          return <div>{JSON.stringify(part)}</div>;
      }
    });
  }
  
  // Fallback to content
  return <div>{message.content}</div>;
};
```

### 4. Loading States & Error Handling

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const safeApiCall = async (apiFunction: () => Promise<any>) => {
  try {
    setLoading(true);
    setError(null);
    return await apiFunction();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
    throw err;
  } finally {
    setLoading(false);
  }
};
```

## Type Definitions Summary

```typescript
// Client initialization
interface ClientOptions {
  baseUrl: string;
  retries?: number;
}

// Thread operations
interface CreateThreadParams {
  threadId: string;
  title: string;
  metadata?: Record<string, any>;
  resourceId: string;
  agentId: string;
}

interface GetThreadsParams {
  resourceId: string;
  agentId: string;
}

// Message operations
interface GetMessagesParams {
  limit?: number;
}

interface GetMemoryThreadMessagesResponse {
  messages: CoreMessage[];
  uiMessages: UIMessage[];
}
```

## Common Use Cases

### 1. Chat Application
- List conversation threads
- Display messages with rich formatting
- Handle tool invocations and reasoning

### 2. Knowledge Management
- Organize conversations by topic (metadata)
- Search through thread history
- Export conversation data

### 3. Agent Interaction
- Multiple agents with separate threads
- Cross-agent conversation references
- Agent-specific memory management

## Debugging Tips

### 1. Console Logging
```typescript
console.log('Thread object:', thread);
console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(thread)));
console.log('Messages response:', messagesResponse);
console.log('UI Messages:', messagesResponse.uiMessages);
```

### 2. Response Structure Inspection
```typescript
// Log detailed structure
if (messagesResponse) {
  console.log('Response keys:', Object.keys(messagesResponse));
  console.log('Messages count:', messagesResponse.messages?.length || 0);
  console.log('UI Messages count:', messagesResponse.uiMessages?.length || 0);
  
  if (messagesResponse.uiMessages?.[0]) {
    const sample = messagesResponse.uiMessages[0];
    console.log('Sample message structure:', {
      id: sample.id,
      role: sample.role,
      partsCount: sample.parts?.length || 0,
      hasToolInvocations: !!sample.toolInvocations?.length,
      hasReasoning: !!sample.reasoning,
    });
  }
}
```

This documentation covers the essential aspects of the Mastra Client SDK based on our implementation experience. The SDK provides a robust interface for memory management and conversation handling with rich message formatting capabilities. 