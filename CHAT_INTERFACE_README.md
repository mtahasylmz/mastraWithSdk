# Chat Interface for Mastra Framework

A modern, responsive chat interface built with Next.js, TypeScript, and shadcn/ui components for interacting with Mastra AI agents.

## Features

### 🗂️ Thread Management
- **List Conversations**: View all conversation threads in a sidebar
- **Create New Threads**: Start new conversations with custom titles
- **Search Threads**: Find specific conversations by title or ID
- **Delete Threads**: Remove unwanted conversations
- **Auto-selection**: Automatically select the first thread when loading

### 💬 Rich Messaging
- **Multiple Message Types**: Support for text, reasoning, tool invocations, and more
- **Message Parts**: Handle complex message structures with different content types
- **Tool Invocations**: Display AI tool usage with expandable details
- **AI Reasoning**: Show the AI's thought process in dedicated sections
- **Timestamps**: Display message creation times
- **Role-based Styling**: Different visual styles for user, assistant, and system messages

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Built-in dark/light theme support
- **Smooth Animations**: Polished transitions and micro-interactions
- **Keyboard Shortcuts**: 
  - `Enter` to send messages
  - `Shift + Enter` for new lines
  - `Escape` to cancel thread creation
- **Auto-scroll**: Automatically scroll to new messages
- **Loading States**: Visual feedback during API operations

### 🔧 Developer Experience
- **TypeScript**: Full type safety with comprehensive interfaces
- **Component Architecture**: Modular, reusable components
- **Error Handling**: Robust error handling with user feedback
- **Console Logging**: Detailed logging for debugging
- **Extensible**: Easy to add new features and customize

## Project Structure

```
src/
├── components/
│   └── chat/
│       ├── ChatLayout.tsx      # Main layout container
│       ├── ThreadsSidebar.tsx  # Thread list and management
│       ├── ChatArea.tsx        # Message display and input area
│       ├── MessageList.tsx     # Individual message rendering
│       ├── MessageInput.tsx    # Message composition component
│       └── index.ts            # Component exports
├── types/
│   └── chat.ts                 # TypeScript interfaces
├── app/
│   ├── chat/
│   │   └── page.tsx            # Chat page route
│   └── page.tsx                # Home page with navigation
└── lib/
    └── mastraClient.ts         # Mastra SDK client setup
```

## Components Overview

### ChatLayout
The main container component that orchestrates thread management and chat functionality.

**Key Features:**
- Manages thread state and operations
- Handles thread creation, deletion, and selection
- Provides data to child components
- Responsive layout with sidebar and main area

### ThreadsSidebar
Displays and manages conversation threads with search and creation capabilities.

**Key Features:**
- Thread list with search functionality
- New thread creation with custom titles
- Thread selection and deletion
- Empty state handling
- Loading states

### ChatArea
The main chat interface displaying messages and providing input functionality.

**Key Features:**
- Message fetching and display
- Loading and empty states
- Message input integration
- Header with thread information
- Auto-scrolling to new messages

### MessageList
Renders individual messages with support for complex message structures.

**Key Features:**
- Role-based message styling
- Message parts rendering (text, reasoning, tools)
- Expandable tool invocations and reasoning
- Timestamp display
- Avatar and role indicators

### MessageInput
Provides a rich text input interface for composing messages.

**Key Features:**
- Auto-resizing textarea
- Keyboard shortcuts
- Send button with loading states
- Character count
- Attachment button (placeholder)

## Usage

### Basic Setup

1. **Start the development server:**
   ```bash
   npm run next:dev
   ```

2. **Navigate to the chat interface:**
   Visit `http://localhost:3000/chat` or click "Start Chat Session" from the home page.

3. **Environment Configuration:**
   Ensure your `.env.local` file has the correct Mastra API URL:
   ```env
   NEXT_PUBLIC_MASTRA_API=http://localhost:4111
   ```

### Using the Interface

1. **Creating Conversations:**
   - Click the "New" button in the sidebar
   - Optionally enter a custom title
   - Press Enter or click "Create"

2. **Selecting Conversations:**
   - Click any thread in the sidebar to view its messages
   - The first thread is automatically selected on load

3. **Sending Messages:**
   - Type in the message input area at the bottom
   - Press Enter to send (Shift+Enter for new lines)
   - Watch for visual feedback during sending

4. **Viewing Message Details:**
   - Click chevron icons to expand tool invocations
   - View AI reasoning in dedicated sections
   - See timestamps and role indicators

### Configuration

The chat interface uses these key configuration values:

```typescript
// In ChatLayout.tsx
const resourceId = "user-123";      // User identifier
const agentId = "articleAgent";     // Agent identifier
```

You can modify these values to match your specific setup:

- **resourceId**: Identifies the user or context
- **agentId**: Must match your Mastra agent configuration

## Message Structure

The interface supports rich message structures from the Mastra SDK:

### UI Message Format
```typescript
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
```

### Message Parts
Messages can contain different types of content:

- **Text Parts**: Plain text content
- **Reasoning Parts**: AI thought process
- **Tool Invocation Parts**: Function calls and results
- **Source Parts**: Reference materials
- **File Parts**: File attachments with MIME types

## API Integration

The chat interface integrates with the Mastra SDK:

### Thread Operations
```typescript
// List threads
const threads = await mastra_sdk.getMemoryThreads({
  resourceId: "user-123",
  agentId: "articleAgent"
});

// Create thread
const newThread = await mastra_sdk.createMemoryThread({
  threadId: `thread_${Date.now()}`,
  title: "New Conversation",
  metadata: { category: "general" },
  resourceId: "user-123",
  agentId: "articleAgent"
});

// Get thread object
const thread = await mastra_sdk.getMemoryThread(threadId, agentId);
```

### Message Operations
```typescript
// Get messages
const messagesResponse = await thread.getMessages();
const uiMessages = messagesResponse.uiMessages; // Use for display

// Thread management
await thread.update({ title: "Updated Title" });
await thread.delete();
```

## Customization

### Styling
The interface uses Tailwind CSS and shadcn/ui components. Customize by:

1. **Modifying CSS classes** in component files
2. **Updating shadcn theme** in `tailwind.config.js`
3. **Adding custom CSS** in `globals.css`

### Adding Features
Extend the interface by:

1. **Adding new message types** in `MessageList.tsx`
2. **Implementing file attachments** in `MessageInput.tsx`
3. **Adding thread filters** in `ThreadsSidebar.tsx`
4. **Creating new components** in the `components/chat/` directory

### Configuration Options
Key configuration points:

```typescript
// In ChatLayout.tsx - User and agent configuration
const resourceId = "your-user-id";
const agentId = "your-agent-id";

// In MessageInput.tsx - Input behavior
const maxMessageLength = 4000;
const textareaMaxHeight = 200;

// In ThreadsSidebar.tsx - Display options
const threadsPerPage = 50;
const searchMinLength = 2;
```

## Error Handling

The interface includes comprehensive error handling:

- **Network Errors**: Retry mechanisms and user feedback
- **API Errors**: Graceful degradation and error messages
- **Validation**: Input validation and type checking
- **Loading States**: Visual feedback during operations

## Performance Considerations

- **Lazy Loading**: Messages loaded on demand
- **Virtualization**: For large thread lists (can be implemented)
- **Debounced Search**: Reduces API calls during search
- **Optimistic Updates**: Immediate UI updates for better UX

## Accessibility

The interface follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets WCAG guidelines
- **Focus Management**: Logical tab order and focus indicators

## Troubleshooting

### Common Issues

1. **Server Not Starting:**
   ```bash
   # Check if port 3000 is available
   lsof -i :3000
   
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Mastra API Connection:**
   ```bash
   # Verify Mastra server is running
   curl http://localhost:4111/health
   
   # Check environment variables
   echo $NEXT_PUBLIC_MASTRA_API
   ```

3. **TypeScript Errors:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   npm install
   ```

### Debug Mode

Enable detailed logging by adding to your `.env.local`:
```env
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## Contributing

To contribute to the chat interface:

1. **Follow TypeScript best practices**
2. **Add prop types for all components**
3. **Include error handling**
4. **Add appropriate comments**
5. **Test on multiple screen sizes**
6. **Ensure accessibility compliance**

## Future Enhancements

Planned improvements:

- [ ] Real-time message synchronization
- [ ] File upload and attachment support
- [ ] Message search within threads
- [ ] Thread categories and tags
- [ ] Export conversation functionality
- [ ] Message reactions and annotations
- [ ] Voice message support
- [ ] Multi-agent conversations
- [ ] Thread sharing and collaboration

This chat interface provides a solid foundation for building sophisticated AI-powered conversation applications with the Mastra framework. 