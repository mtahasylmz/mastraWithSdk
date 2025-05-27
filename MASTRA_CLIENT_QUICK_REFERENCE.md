# Mastra Client SDK - Quick Reference

## Setup
```typescript
import { MastraClient } from "@mastra/client-js";

const mastra_sdk = new MastraClient({
  baseUrl: "http://localhost:4111",
  retries: 3,
});
```

## Essential Operations

### 1. List Threads
```typescript
const threads = await mastra_sdk.getMemoryThreads({
  resourceId: "user-123",
  agentId: "articleAgent"
});
```

### 2. Create Thread
```typescript
const thread = await mastra_sdk.createMemoryThread({
  threadId: `thread_${Date.now()}`,
  title: "New Chat",
  metadata: { category: "general" },
  resourceId: "user-123",
  agentId: "articleAgent"
});
```

### 3. Get Thread Object
```typescript
const threadObj = await mastra_sdk.getMemoryThread(threadId, agentId);
```

### 4. Get Messages
```typescript
const messages = await threadObj.getMessages();
// Use: messages.uiMessages for UI display
```

### 5. Stream Messages (NEW)
```typescript
// Get agent instance
const agent = mastra_sdk.getAgent("articleAgent");

// Stream message with real-time response
const response = await agent.stream({
  messages: ["What's the latest in AI research?"],
  resourceId: "user-123",
  threadId: "thread_1705123456789"
});

// Process stream events
await response.processDataStream({
  onTextPart: (text) => {
    console.log('Text chunk:', text);
    // Update UI with streaming text
  },
  onReasoningPart: (reasoning) => {
    console.log('AI reasoning:', reasoning);
  },
  onToolCallPart: (toolCall) => {
    console.log('Tool used:', toolCall);
  },
  onFinishMessagePart: (message) => {
    console.log('Message complete');
    // Refresh thread messages
  }
});
```

## Message Structure
```typescript
// Response format
{
  messages: CoreMessage[],      // Raw system messages
  uiMessages: UIMessage[]       // UI-optimized messages
}

// UIMessage format
{
  id: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  parts: [
    { type: 'text', text: string },
    { type: 'reasoning', reasoning: string },
    { type: 'tool-invocation', toolInvocation: any }
  ],
  createdAt: Date,
  toolInvocations?: any[],
  reasoning?: string
}
```

## Thread Object Methods
```typescript
await thread.get()              // Get thread details
await thread.update(params)     // Update thread
await thread.delete()           // Delete thread
await thread.getMessages()      // Get messages
```

## Error Handling Pattern
```typescript
try {
  const thread = await mastra_sdk.getMemoryThread(threadId, agentId);
  if (thread && typeof thread.getMessages === 'function') {
    const messages = await thread.getMessages();
    if (messages.uiMessages) {
      // Use messages.uiMessages for display
    }
  }
} catch (error) {
  console.error('Error:', error);
}
```

## Common Patterns

### Display Messages
```typescript
const renderMessage = (msg) => {
  if (msg.parts) {
    return msg.parts.map(part => {
      switch (part.type) {
        case 'text': return part.text;
        case 'reasoning': return `Reasoning: ${part.reasoning}`;
        case 'tool-invocation': return `Tool: ${JSON.stringify(part.toolInvocation)}`;
      }
    });
  }
  return msg.content;
};
```

### Real-time Chat Hook (NEW)
```typescript
const useMessageStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(null);

  const sendMessage = async (message, threadId) => {
    setIsStreaming(true);
    const agent = mastra_sdk.getAgent("articleAgent");
    
    const response = await agent.stream({
      messages: [message],
      resourceId: "user-123",
      threadId
    });

    await response.processDataStream({
      onTextPart: (text) => {
        setStreamingMessage(prev => ({
          ...prev,
          content: (prev?.content || '') + text
        }));
      },
      onFinishMessagePart: () => {
        setIsStreaming(false);
        // Refresh full conversation
      }
    });
  };

  return { isStreaming, streamingMessage, sendMessage };
};
```

### Thread Management Hook
```typescript
const useThreads = (resourceId, agentId) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const result = await mastra_sdk.getMemoryThreads({ resourceId, agentId });
      setThreads(result || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  return { threads, loading, fetchThreads };
};
```

## Stream Events Reference
- `onTextPart`: Receive text chunks in real-time
- `onReasoningPart`: AI thinking process  
- `onToolCallPart`: Tool invocations
- `onToolResultPart`: Tool execution results
- `onFinishMessagePart`: Message generation complete
- `onErrorPart`: Handle streaming errors

## Key Constants
```typescript
const CONFIG = {
  resourceId: "user-123",           // User identifier
  agentId: "articleAgent",          // Agent identifier
  baseUrl: "http://localhost:4111", // Mastra server URL
};
``` 