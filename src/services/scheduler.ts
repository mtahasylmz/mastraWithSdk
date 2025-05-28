import { fetchAndUpsertYesterday } from './arxiv';

/**
 * Daily scheduler for arxiv paper renewal
 * This should be run once per day to fetch and store the latest papers
 */
export class ArxivScheduler {
  private interval: NodeJS.Timeout | null = null;
  
  /**
   * Start the daily renewal process
   * @param hourUTC - Hour in UTC to run the renewal (0-23, default: 6 for 6 AM UTC)
   */
  public startDailyRenewal(hourUTC: number = 6): void {
    
    // Calculate initial delay to next scheduled time
    const now = new Date();
    const nextRun = new Date();
    nextRun.setUTCHours(hourUTC, 0, 0, 0);
    
    // If the scheduled time has passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }
    
    const initialDelay = nextRun.getTime() - now.getTime();
    
    console.log(`Arxiv renewal scheduled for ${nextRun.toISOString()} (yesterday papers mode)`);
    
    // Set initial timeout
    setTimeout(() => {
      this.runRenewal();
      
      // Then run every 24 hours
      this.interval = setInterval(() => {
        this.runRenewal();
      }, 24 * 60 * 60 * 1000);
    }, initialDelay);
  }
  
  /**
   * Stop the daily renewal process
   */
  public stopDailyRenewal(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Arxiv renewal scheduler stopped');
    }
  }
  
  /**
   * Run the renewal process immediately
   */
  public async runRenewal(): Promise<void> {
    try {
      console.log('Starting arxiv paper renewal process...');
      
      await fetchAndUpsertYesterday();
      
      console.log('Arxiv paper renewal completed successfully');
    } catch (error) {
      console.error('Error during arxiv paper renewal:', error);
    }
  }
}

// Export a singleton instance
export const arxivScheduler = new ArxivScheduler(); 