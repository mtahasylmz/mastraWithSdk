import { Index } from '@upstash/vector';
import { ArxivPaper, fetchLatestArxivPapers, beginningStackArxivPapers} from "./scraper";
import { openai } from "@ai-sdk/openai";
import { embedMany } from 'ai'



const vectorStore = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_TOKEN!,
});


const getId = (paper: ArxivPaper) => {
    return paper.id;
}

async function filterExistingPapers(papers: ArxivPaper[]): Promise<ArxivPaper[]> {
    
    let paperLength = papers.length;

    let paperIds: string[] = [];
    papers.forEach(paper =>
        paperIds.push(paper.id)
    )
    
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
        return papers;
    }

    let existingPaperIds: string[] = [];
    existingPapers.forEach(paper => {
        existingPaperIds.push(paper.id.toString())
    })
    let newPapers : ArxivPaper[] = papers.filter(paper => !existingPaperIds.includes(paper.id))
    
    
    return newPapers;
}

async function storeAbstracts(papers: ArxivPaper[]) {
    const newPapers = await filterExistingPapers(papers);
    
    if (newPapers.length === 0) {
        return;
    }

     const embeddingModel = openai.embedding("text-embedding-3-small");
    
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
        return;
    }

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
    let errorCount = 0;
    for (let j = 0; j < vectorsToUpsert.length; j++) {        
        try {
            await vectorStore.upsert(vectorsToUpsert[j], { namespace: "arxiv" });
        } catch (error) {
            errorCount++;
        }
    }   

}

export async function fetchAndUpsertYesterday(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const papers = await fetchLatestArxivPapers(yesterday.toISOString().split('T')[0]);
    await storeAbstracts(papers);
}

export async function fetchBeginningStack() : Promise<void> {
    const papers = await beginningStackArxivPapers();
    await storeAbstracts(papers);
} 

