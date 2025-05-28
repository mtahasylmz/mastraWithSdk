# Mastra SDK Integration - Chat Components

This document outlines the integration of the Mastra SDK with the chat components, implementing proper thread fetching and management.

## Overview

The chat interface has been completely refactored to use the Mastra SDK for:
- Thread management (create, fetch, delete)
- Message retrieval with rich formatting
- Error handling and loading states
- Integration with the `articleAgent`

## Key Changes

### 1. Configuration (`src/lib/mastra-config.ts`)
Centralized configuration for Mastra client settings:
```typescript
export const MASTRA_CONFIG = {
  resourceId: process.env.NEXT_PUBLIC_RESOURCE_ID || "user-123",
  agentId: "articleAgent", // Matches your agent configuration
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API || "http://localhost:4111",
  retries: 3,
};
```

### 2. Custom Hooks

#### `useThreads` Hook (`src/hooks/useThreads.ts`)
Manages thread operations:
- `fetchThreads()` - Retrieves all threads for the user
- `createThread()` - Creates new conversation threads
- `deleteThread()` - Removes threads
- Automatic loading states and error handling

#### `useMessages` Hook (`src/hooks/useMessages.ts`)
Handles message operations:
- `fetchMessages(threadId)` - Retrieves messages for a specific thread
- Supports Mastra's `UIMessage` format with rich content parts
- Handles tool invocations, reasoning, and file attachments

### 3. Updated Components

#### ChatSidebar (`src/components/chat/ChatSidebar.tsx`)
- Real-time thread fetching from Mastra
- Thread creation and deletion
- Loading states and error handling
- Enhanced UI with thread metadata display

#### ChatMessages (`src/components/chat/ChatMessages.tsx`)
- Full support for Mastra's `UIMessage` format
- Rich rendering of message parts:
  - Text content
  - AI reasoning display
  - Tool invocation visualization
  - Source and file attachments
- System message support

#### ChatInterface (`src/components/chat/ChatInterface.tsx`)
- Integrated thread and message management
- Welcome screen for new users
- Error boundary integration
- Responsive design with sidebar toggle

### 4. Error Handling (`src/components/ErrorBoundary.tsx`)
- React Error Boundary for graceful error handling
- User-friendly error messages
- Retry functionality
- Debug information for development

## Environment Variables

Add these to your `.env.local`:
```bash
NEXT_PUBLIC_MASTRA_API=http://localhost:4111
NEXT_PUBLIC_RESOURCE_ID=user-123
```

## Features Implemented

### ✅ Thread Management
- [x] Fetch threads from Mastra memory
- [x] Create new threads with metadata
- [x] Delete threads with confirmation
- [x] Thread selection and navigation
- [x] Loading states and error handling

### ✅ Message Display
- [x] Mastra UIMessage format support
- [x] Rich message parts rendering
- [x] Tool invocation display
- [x] AI reasoning visualization
- [x] System message handling
- [x] Timestamp formatting

### ✅ User Experience
- [x] Responsive sidebar
- [x] Loading indicators
- [x] Error boundaries
- [x] Empty states
- [x] Welcome screen

### 🚧 Next Phase (Message Sending)
- [ ] Implement message sending to Mastra agent
- [ ] Real-time streaming responses
- [ ] Message optimistic updates
- [ ] Typing indicators

## Usage

### Basic Usage
```typescript
import ChatInterface from "@/components/chat/ChatInterface";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
}
```

### Custom Hook Usage
```typescript
import { useThreads, useMessages } from "@/hooks";

function CustomChatComponent() {
  const { threads, loading, createThread } = useThreads();
  const { messages, fetchMessages } = useMessages();
  
  // Your custom implementation
}
```

## Message Format

The components support Mastra's rich `UIMessage` format:

```typescript
interface UIMessage {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  createdAt?: Date;
  reasoning?: string;
  toolInvocations?: any[];
  parts?: MessagePart[];
}

interface MessagePart {
  type: 'text' | 'reasoning' | 'tool-invocation' | 'source' | 'file';
  text?: string;
  reasoning?: string;
  toolInvocation?: any;
  // ... other properties
}
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Automatic retry with user feedback
2. **API Errors**: Graceful degradation with error messages
3. **Component Errors**: Error boundaries with recovery options
4. **Validation Errors**: Input validation and user guidance

## Performance Considerations

- **Memoized Callbacks**: Prevents unnecessary re-renders
- **Lazy Loading**: Messages loaded only when thread is selected
- **Error Boundaries**: Prevents entire app crashes
- **Optimistic Updates**: Immediate UI feedback for user actions

## Development

### Running the Application
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Testing Thread Operations
1. Start the Mastra server on port 4111
2. Open the application
3. Create a new thread using the "New Chat" button
4. Select threads to view messages
5. Test error scenarios by stopping the Mastra server

### Debugging
- Check browser console for detailed error logs
- Use the error boundary details for debugging
- Monitor network requests in DevTools
- Verify environment variables are set correctly

## Architecture

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx    # Main chat container
│   │   ├── ChatSidebar.tsx      # Thread management
│   │   ├── ChatMessages.tsx     # Message display
│   │   └── ChatInput.tsx        # Message input (unchanged)
│   ├── ui/                      # Reusable UI components
│   └── ErrorBoundary.tsx        # Error handling
├── hooks/
│   ├── useThreads.ts           # Thread management hook
│   └── useMessages.ts          # Message management hook
├── lib/
│   ├── mastraClient.ts         # Mastra client instance
│   └── mastra-config.ts        # Configuration constants
└── app/
    └── page.tsx                # Main application page
```

## Next Steps

1. **Message Sending**: Implement agent communication
2. **Real-time Updates**: Add WebSocket support for live updates
3. **Message Search**: Implement search across conversation history
4. **Export/Import**: Add conversation export functionality
5. **User Management**: Multi-user support with proper authentication

## Troubleshooting

### Common Issues

1. **"Failed to load conversations"**
   - Check if Mastra server is running on port 4111
   - Verify `NEXT_PUBLIC_MASTRA_API` environment variable
   - Check network connectivity

2. **"Thread object invalid"**
   - Ensure agent ID matches your Mastra configuration
   - Check if the thread exists in Mastra memory
   - Verify resource ID is consistent

3. **Empty message list**
   - Check if thread has any messages
   - Verify message format compatibility
   - Check browser console for API errors

### Debug Mode
Set `NODE_ENV=development` to enable detailed logging and error information.

---

This integration provides a solid foundation for building chat applications with Mastra AI, focusing on proper thread management and rich message display capabilities. 