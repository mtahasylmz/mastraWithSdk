import axios from "axios";
import { parseStringPromise } from "xml2js";
import dotenv from "dotenv";
dotenv.config();

const categories = process.env.CATEGORIES?.split(',') || []; //https://arxiv.org/category_taxonomy
const maxResults = 300;
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

export async function fetchLatestArxivPapers(targetDate : string): Promise<ArxivPaper[]> {

    if (categories.length === 0) {
        throw new Error("No categories specified");
    }
    const searchQuery = categories.length === 1 ? `cat:${categories[0]}` : `(${categories.map(c => `cat:${c}`).join(" OR ")})`;

    const query = `search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

    const url = `http://export.arxiv.org/api/query?${query}`;

    const response = await axios.get(url);
    const parsed = await parseStringPromise(response.data);

    const entries = parsed.feed.entry;
    if (!entries) return [];
    

    const normalizedEntries = Array.isArray(entries) ? entries : [entries];

    return normalizedEntries.filter(entry => isSameDay(entry.published, targetDate)).map((entry: any): ArxivPaper => ({
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
