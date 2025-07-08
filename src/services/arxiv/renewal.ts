import { Index } from '@upstash/vector';
import { ArxivPaper, fetchLatestArxivPapers, beginningStackArxivPapers} from "./scraper";
import { openai } from "@ai-sdk/openai";
import { embedMany } from 'ai'
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
    
    let paperLength = papers.length;
    console.log(`Checking ${paperLength} papers for existing entries...`);

    let paperIds: string[] = [];
    papers.forEach(paper =>
        paperIds.push(paper.id)
    )
    
    // pagination with 1000
    let i = Math.ceil(paperLength / 1000);
    let existingPapers: any[] = [];

    for (let j = 0; j < i; j++) {
        let start = j * 1000;
        let end = start + 1000;
        let tempPapers = await vectorStore.fetch(paperIds.slice(start, end), { includeMetadata: false, includeData: false, namespace: "arxiv" });
        if (tempPapers !== null) {
            existingPapers.push(...tempPapers);
        }
    }
    existingPapers = existingPapers.filter(paper => paper !== null);
    if (existingPapers.length === 0) {
        console.log("No existing papers found, returning all papers");
        return papers;
    }
    console.log(`Existing papers: ${existingPapers.length}`);

    let existingPaperIds: string[] = [];
    existingPapers.forEach(paper => {
        existingPaperIds.push(paper.id.toString())
    })
    let newPapers : ArxivPaper[] = papers.filter(paper => !existingPaperIds.includes(paper.id))
    
    
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

    // //Generate embeddings for all new abstracts using OpenAI directly
    // const embeddings = [];
     const embeddingModel = openai.embedding("text-embedding-3-small");
    
    // console.log(`Generating embeddings for ${newPapers.length} new papers...`);
    
    // for (const paper of newPapers) {
    //     try {
    //         const result = await embeddingModel.doEmbed({ values: [paper.abstract] });
    //         embeddings.push(result.embeddings[0]);
    //     } catch (error) {
    //         console.error(`Error generating embedding for paper ${paper.id}:`, error);
    //         // Skip this paper if embedding fails
    //         continue;
    //     }
    // }

    let embeddings : any[] = [];
    let i = Math.ceil(newPapers.length / 500);
    for (let j = 0; j < i; j++) {
        let start = j * 500;
        let end = start + 500;
        let tempResult = await embedMany({
            model: embeddingModel,
            values: newPapers.slice(start, end).map(paper => paper.abstract)
        })
        embeddings.push(...tempResult.embeddings);
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
    // pagination with 1000
    i = Math.ceil(vectorsToUpsert.length / 1000);
    for (let j = 0; j < i; j++) {
        let start = j * 1000;
        let end = start + 1000;
        await vectorStore.upsert(vectorsToUpsert.slice(start, end), { namespace: "arxiv" });
    }
    
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

