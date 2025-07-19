import { MastraClient } from "@mastra/client-js";
 
export const mastra_sdk = new MastraClient({
    baseUrl: process.env.NEXT_PUBLIC_MASTRA_API!,
    retries: 3,
  });
