import axios from "axios";
import { parseStringPromise } from "xml2js";
import 'dotenv/config';

const categories = process.env.CATEGORIES?.split(',') || []; //https://arxiv.org/category_taxonomy
const maxResultsPerCall = 2000; // Maximum per API call as per arXiv API limits
const beginStack = 1000;

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

/**
 * Fetch ALL papers for a specific date using pagination
 * This will make multiple API calls to get all papers for the target date
 */
export async function fetchLatestArxivPapers(targetDate: string): Promise<ArxivPaper[]> {
    if (categories.length === 0) {
        throw new Error("No categories specified");
    }
    
    const searchQuery = categories.length === 1 ? `cat:${categories[0]}` : `(${categories.map(c => `cat:${c}`).join(" OR ")})`;
    const allPapers: ArxivPaper[] = [];
    let start = 0;
    let hasMoreResults = true;
    
    console.log(`Fetching ALL papers for ${targetDate}...`);
    
    while (hasMoreResults) {
        const query = `search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${maxResultsPerCall}`;
        const url = `http://export.arxiv.org/api/query?${query}`;
        
        console.log(`Fetching batch ${Math.floor(start / maxResultsPerCall) + 1} (results ${start}-${start + maxResultsPerCall - 1})...`);
        
        try {
            const response = await axios.get(url);
            const parsed = await parseStringPromise(response.data);
            const entries = parsed.feed.entry;
            
            if (!entries || entries.length === 0) {
                console.log(`No more entries found at start=${start}`);
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
            
            // Check if we've found papers from a different date (meaning we've gone too far back)
            const hasOlderPapers = normalizedEntries.some(entry => 
                entry.published[0].slice(0, 10) < targetDate
            );
            
            if (hasOlderPapers || normalizedEntries.length < maxResultsPerCall) {
                console.log(`Reached end of results for ${targetDate}. Found papers from earlier dates or fewer results than requested.`);
                hasMoreResults = false;
            } else {
                start += maxResultsPerCall;
                
                // Add a small delay to be nice to the arXiv servers
                if (start > 0) {
                    console.log('Waiting 3 seconds before next request...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
        } catch (error) {
            console.error(`Error fetching batch at start=${start}:`, error);
            // If we get an error, stop trying to fetch more
            hasMoreResults = false;
        }
    }
    
    console.log(`Finished fetching. Found ${allPapers.length} papers for ${targetDate}`);
    return allPapers;
}

/**
 * Fetch recent papers without strict date filtering
 * This is more efficient when combined with duplicate checking in the renewal process
 */
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



///

export async function beginningStackArxivPapers(): Promise<ArxivPaper[]> {

    if (categories.length === 0) {
        throw new Error("No categories specified");
    }
    const searchQuery = categories.length === 1 ? `cat:${categories[0]}` : `(${categories.map(c => `cat:${c}`).join(" OR ")})`;

    const query = `search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${beginStack}`;

    console.log(`Fetching beginning stack: ${beginStack} papers...`);

    const url = `http://export.arxiv.org/api/query?${query}`;

    const response = await axios.get(url);
    const parsed = await parseStringPromise(response.data);

    const entries = parsed.feed.entry;
    if (!entries) return [];
    

    const normalizedEntries = Array.isArray(entries) ? entries : [entries];

    const papers = normalizedEntries.map((entry: any): ArxivPaper => ({
        id: entry.id[0],
        title: entry.title[0],
        abstract: entry.summary[0],
        authors: entry.author.map((author: any) => author.name[0]),
        published: entry.published[0],
        pdfUrl: entry.link.find((link: any) => link.$.title === "pdf").$.href,
        category: entry.category[0].$.term,
    }));

    console.log(`Beginning stack fetched: ${papers.length} papers`);
    return papers;
} 