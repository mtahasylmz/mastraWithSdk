import { Index } from '@upstash/vector';
import { ArxivPaper, fetchLatestArxivPapers, beginningStackArxivPapers } from "./scraper";
import { openai } from "@ai-sdk/openai";
import 'dotenv/config';


const vectorStore = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_TOKEN!,
});


const getId = (paper: ArxivPaper) => {
    return paper.id;
}

// Function to check if papers already exist in the vector database
async function filterExistingPapers(papers: ArxivPaper[]): Promise<ArxivPaper[]> {
    const newPapers: ArxivPaper[] = [];
    
    console.log(`Checking ${papers.length} papers for existing entries...`);
    
    for (const paper of papers) {
        try {
            // Try to fetch the paper by ID to see if it exists
            const existingPaper = await vectorStore.fetch([paper.id], { namespace: "arxiv" });
            
            // Check if paper actually exists - handle [null] case from Upstash
            if (!existingPaper || existingPaper.length === 0 || existingPaper[0] === null) {
                // Paper doesn't exist, add it to new papers list
                newPapers.push(paper);
            } else {
                console.log(`Paper ${paper.id} already exists, skipping...`);
            }
        } catch (error) {
            // If fetch fails, assume paper doesn't exist and include it
            console.log(`Could not check existence for ${paper.id}, including it: ${error}`);
            newPapers.push(paper);
        }
    }
    
    console.log(`Found ${newPapers.length} new papers out of ${papers.length} total`);
    return newPapers;
}

// Function to process document and store embeddings
async function storeAbstracts(papers: ArxivPaper[]) {
    // First, filter out papers that already exist
    const newPapers = await filterExistingPapers(papers);
    
    if (newPapers.length === 0) {
        console.log("No new papers to process, skipping embedding generation");
        return;
    }

    //Generate embeddings for all new abstracts using OpenAI directly
    const embeddings = [];
    const embeddingModel = openai.embedding("text-embedding-3-small");
    
    console.log(`Generating embeddings for ${newPapers.length} new papers...`);
    
    for (const paper of newPapers) {
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

    // Prepare vectors for upsert in Upstash format
    const vectorsToUpsert = embeddings.map((embedding, index) => {
        const paper = newPapers[index];
        return {
            id: paper.id,
            vector: embedding,
            metadata: {
                title: paper.title,
                abstract: paper.abstract,
                authors: paper.authors,
                published: paper.published,
                pdfUrl: paper.pdfUrl,
                category: paper.category
            }
        };
    });

    // Store in vector DB using Upstash native format
    await vectorStore.upsert(vectorsToUpsert, { namespace: "arxiv" });
    
    console.log(`Successfully stored ${vectorsToUpsert.length} new papers in vector database`);

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
    console.log(`Processed ${papers.length} papers for beginning stack.`);
} 