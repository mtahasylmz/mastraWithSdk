// Thread-related types
export interface Thread {
  id: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Message-related types
export interface MessagePart {
  type: string;
  text?: string;
  reasoning?: string;
  toolInvocation?: any;
  source?: any;
  mimeType?: string;
  data?: string;
  [key: string]: any;
}

export interface UIMessage {
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

export interface CoreMessage {
  id: string;
  role: string;
  content: string;
  createdAt?: Date;
  [key: string]: any;
}

// API Response types
export interface GetMemoryThreadMessagesResponse {
  messages: CoreMessage[];
  uiMessages: UIMessage[];
}

// Mastra Client types
export interface GetThreadsParams {
  resourceId: string;
  agentId: string;
}

export interface CreateThreadParams {
  threadId: string;
  title: string;
  metadata?: Record<string, any>;
  resourceId: string;
  agentId: string;
}

export interface GetMessagesParams {
  limit?: number;
}

// Component Props types
export interface ThreadsSidebarProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onCreateThread: (title?: string) => void;
  onDeleteThread: (threadId: string) => void;
  loading: boolean;
}

export interface ChatAreaProps {
  selectedThreadId: string | null;
  agentId: string;
}

export interface MessageListProps {
  messages: UIMessage[];
}

export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
} 