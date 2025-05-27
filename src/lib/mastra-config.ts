export const MASTRA_CONFIG = {
  resourceId: process.env.NEXT_PUBLIC_RESOURCE_ID || "articleAgent",
  agentId: "articleAgent", // Should match your agent configuration
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API || "http://localhost:4111",
  retries: 3,
};

export const THREAD_CONFIG = {
  defaultTitle: "New Conversation",
  defaultMetadata: { category: "general" },
}; 
