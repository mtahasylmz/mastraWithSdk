import { MastraClient } from "@mastra/client-js";
 
export const mastra_sdk = new MastraClient({
    baseUrl: process.env.NEXT_PUBLIC_MASTRA_API || "http://localhost:4111",
    retries: 3,
  });
