import { myMastraUpstashVector } from "../agents/memory";
import { ArxivPaper } from "./arxiv_scraper";
import { openai } from "@ai-sdk/openai";
import { fetchLatestArxivPapers } from "./arxiv_scraper";
import 'dotenv/config';
import { beginningStackArxivPapers } from "./arxiv_scraper";

// Initialize Upstash Vector client
export const vectorStore = myMastraUpstashVector;

// Function to process document and store embeddings
async function storeAbstracts(papers: ArxivPaper[]) {

    //Generate embeddings for all abstracts using OpenAI directly
    const embeddings = [];
    const embeddingModel = openai.embedding("text-embedding-3-small");
    
    for (const paper of papers) {
        try {
            const result = await embeddingModel.doEmbed({ values: [paper.abstract] });
            embeddings.push(result.embeddings[0]);
        } catch (error) {
            console.error(`Error generating embedding for paper ${paper.id}:`, error);
            // Skip this paper if embedding fails
            continue;
        }
    }

    if (embeddings.length === 0) {
        console.log("No embeddings generated, skipping upsert");
        return;
    }

    //Store in vector DB with metadata per paper
    await vectorStore.upsert({
        indexName: "ai-arxiv",
        vectors: embeddings,
        metadata: papers.slice(0, embeddings.length).map(paper => ({
            id: paper.id,
            title: paper.title,
            abstract: paper.abstract,
            authors: paper.authors,
            published: paper.published,
            pdfUrl: paper.pdfUrl,
            category: paper.category
        })),
    });

}

export async function fetchAndUpsertYesterday(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const papers = await fetchLatestArxivPapers(yesterday.toISOString().split('T')[0]);
    await storeAbstracts(papers);
    console.log(`Stored ${papers.length} abstracts for yesterday. ${yesterday.toISOString().split('T')[0]}`);
}

export async function fetchBeginningStack() : Promise<void> {
    const papers = await beginningStackArxivPapers();
    await storeAbstracts(papers);
    console.log(`Stored ${papers.length} abstracts for beginning stack.`);
}