import { Memory } from '@mastra/memory';
import { UpstashStore } from '@mastra/upstash';
import { UpstashVector } from '@mastra/upstash';
import { openai } from '@ai-sdk/openai';
export const myMastraUpstashVector = new UpstashVector({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_TOKEN!,
});


export const myMastraUpstashStore = new UpstashStore({
  url: process.env.UPSTASH_REDIS_MEMORY_URL!,
  token: process.env.UPSTASH_REDIS_MEMORY_TOKEN!,
});

export const memory = new Memory({
    storage: myMastraUpstashStore,
    vector: myMastraUpstashVector,
    embedder: openai.embedding("text-embedding-3-small"),
    options: {
      lastMessages: 10,
      semanticRecall: {
        topK: 3,
        messageRange: 2,
      },
      threads: {
        generateTitle: true
      }
    }
});



