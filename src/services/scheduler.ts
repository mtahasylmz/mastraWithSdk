import { fetchAndUpsertYesterday } from './arxiv';

export class ArxivScheduler {
  private interval: NodeJS.Timeout | null = null;
  
  public startDailyRenewal(hourUTC: number = 6): void {
    
    const now = new Date();
    const nextRun = new Date();
    nextRun.setUTCHours(hourUTC, 0, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }
    
    const initialDelay = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      this.runRenewal();
      
      this.interval = setInterval(() => {
        this.runRenewal();
      }, 24 * 60 * 60 * 1000);
    }, initialDelay);
  }
  
  public stopDailyRenewal(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  public async runRenewal(): Promise<void> {
    try {
      
      await fetchAndUpsertYesterday();
      
    } catch (error) {
      
    }
  }
}

export const arxivScheduler = new ArxivScheduler(); 