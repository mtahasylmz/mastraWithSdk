import { embed } from 'ai';
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createTool } from '@mastra/core/tools';
import { vectorStore } from './renewal';
import { ArxivPaper } from './arxiv_scraper';

const querySimilar = async (query: string) => {
  // Generate embedding for query
  const { embedding } = await embed({
    value: query,
    model: openai.embedding("text-embedding-3-small"),
  });
  
  
  const results = await vectorStore.query({
    indexName: "ai-arxiv",
    queryVector: embedding,
    topK: 3,
  });

  // Check if we have results and extract the best match
  if (results && results.length > 0) {
    const bestMatch = results[0];
    const metadata = bestMatch.metadata as ArxivPaper;
    
    return {
      bestOption: {
        abstract: metadata.abstract,
        title: metadata.title,
        pdfUrl: metadata.pdfUrl
      }
    };
  }
  
  // If no results, throw an error
  throw new Error("No relevant information found");
}



 

export const articleQueryTool = createTool({
    id: 'get-relevant-article',
    description: 'Get relative article information',
    inputSchema: z.object({
      question: z.string().describe('the question about the field'),
    }),
    outputSchema: z.object({
      bestOption: z.object({
        abstract: z.string().describe('the abstract of the article'),
        title: z.string().describe('the title of the article'),
        pdfUrl: z.string().describe('the PDF URL of the article')
      })
    }),
    execute: async ({ context }) => {
      return await querySimilar(context.question);
    },
  });



