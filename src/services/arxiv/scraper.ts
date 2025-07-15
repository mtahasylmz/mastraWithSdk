import axios from "axios";
import { parseStringPromise } from "xml2js";


const categories = process.env.CATEGORIES?.split(',') || [];
const maxResultsPerCall = 2000;
const beginStack = 30000;

export interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: string;
  pdfUrl: string;
  category: string;
}


function isSameDay(dateStr: string[], targetDate: string): boolean {
    return dateStr[0].slice(0, 10) === targetDate;
}

export async function fetchLatestArxivPapers(targetDate: string): Promise<ArxivPaper[]> {
    if (categories.length === 0) {
        throw new Error("No categories specified");
    }
    
    const searchQuery = categories.length === 1 ? `cat:${categories[0]}` : `(${categories.map(c => `cat:${c}`).join(" OR ")})`;
    const allPapers: ArxivPaper[] = [];
    let start = 0;
    let hasMoreResults = true;
    
    while (hasMoreResults) {
        const query = `search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${maxResultsPerCall}`;
        const url = `http://export.arxiv.org/api/query?${query}`;
        
        try {
            const response = await axios.get(url);
            const parsed = await parseStringPromise(response.data);
            const entries = parsed.feed.entry;
            
            if (!entries || entries.length === 0) {
                break;
            }
            
            const normalizedEntries = Array.isArray(entries) ? entries : [entries];
            const papersForDate = normalizedEntries
                .filter(entry => isSameDay(entry.published, targetDate))
                .map((entry: any): ArxivPaper => ({
                    id: entry.id[0],
                    title: entry.title[0],
                    abstract: entry.summary[0],
                    authors: entry.author.map((author: any) => author.name[0]),
                    published: entry.published[0],
                    pdfUrl: entry.link.find((link: any) => link.$.title === "pdf").$.href,
                    category: entry.category[0].$.term,
                }));
            
            allPapers.push(...papersForDate);
            
            const hasOlderPapers = normalizedEntries.some(entry => 
                entry.published[0].slice(0, 10) < targetDate
            );
            
            if (hasOlderPapers || normalizedEntries.length < maxResultsPerCall) {
                hasMoreResults = false;
            } else {
                start += maxResultsPerCall;
                
                if (start > 0) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
        } catch (error) {
            hasMoreResults = false;
        }
    }
    
    return allPapers;
}

export async function fetchRecentArxivPapers(maxResultsOverride?: number): Promise<ArxivPaper[]> {
    if (categories.length === 0) {
        throw new Error("No categories specified");
    }
    
    const resultsLimit = maxResultsOverride || 300;
    const searchQuery = categories.length === 1 ? `cat:${categories[0]}` : `(${categories.map(c => `cat:${c}`).join(" OR ")})`;

    const query = `search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${resultsLimit}`;

    const url = `http://export.arxiv.org/api/query?${query}`;

    const response = await axios.get(url);
    const parsed = await parseStringPromise(response.data);

    const entries = parsed.feed.entry;
    if (!entries) return [];
    
    const normalizedEntries = Array.isArray(entries) ? entries : [entries];

    return normalizedEntries.map((entry: any): ArxivPaper => ({
        id: entry.id[0],
        title: entry.title[0],
        abstract: entry.summary[0],
        authors: entry.author.map((author: any) => author.name[0]),
        published: entry.published[0],
        pdfUrl: entry.link.find((link: any) => link.$.title === "pdf").$.href,
        category: entry.category[0].$.term,
    }));
}



export async function beginningStackArxivPapers(): Promise<ArxivPaper[]> {

    if (categories.length === 0) {
        throw new Error("No categories specified");
    }
    const searchQuery = categories.length === 1 ? `cat:${categories[0]}` : `(${categories.map(c => `cat:${c}`).join(" OR ")})`;

    const papers: ArxivPaper[] = [];

    for (let i = 0; i < beginStack; i += maxResultsPerCall) {
        const query = `search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&start=${i}&max_results=${maxResultsPerCall}`;

        const url = `http://export.arxiv.org/api/query?${query}`;

        const response = await axios.get(url);
        const parsed = await parseStringPromise(response.data);

        const entries = parsed.feed.entry;
        if (!entries) continue;
        

        const normalizedEntries = Array.isArray(entries) ? entries : [entries];

        const tempPapers = normalizedEntries.map((entry: any): ArxivPaper => ({
            id: entry.id[0],
            title: entry.title[0],
            abstract: entry.summary[0],
            authors: entry.author.map((author: any) => author.name[0]),
            published: entry.published[0],
            pdfUrl: entry.link.find((link: any) => link.$.title === "pdf").$.href,
            category: entry.category[0].$.term,
        }));

        papers.push(...tempPapers);
    }
    
    return papers;
} 