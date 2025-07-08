import { arxivScheduler } from './scheduler';
import { fetchBeginningStack} from './arxiv';

let isInitialized = false;

/**
 * Initialize services that should run automatically
 * Call this function when your app starts
 */
export function initializeServices() {
  if (isInitialized) {
    console.log('Services already initialized, skipping...');
    return;
  }
  
  console.log('Initializing services...');
  
  // Start daily arxiv renewal at 6 AM UTC
  arxivScheduler.startDailyRenewal(6);
  
  isInitialized = true;
  console.log('Services initialized successfully');
}

/**
 * Full initialization with beginning stack + daily renewals
 * This is the recommended way to start services in production
 */
export async function initializeServicesWithBeginningStack() {
  if (isInitialized) {
    console.log('Services already initialized, skipping...');
    return;
  }
  
  console.log('Initializing services with beginning stack...');
  
  try {
    // 1. First, fetch the beginning stack to populate the database
    console.log('Fetching beginning stack (this may take a few minutes)...');
    await fetchBeginningStack();
    console.log('Beginning stack fetch completed successfully');
   

    // 2. Then start daily renewal schedule
    console.log('Starting daily renewal scheduler...');
    arxivScheduler.startDailyRenewal(6);
    
    isInitialized = true;
    console.log('Services initialized successfully with beginning stack');
  } catch (error) {
    console.error('Error during beginning stack initialization:', error);
    // Still start the scheduler even if beginning stack fails
    console.log('Starting daily renewal scheduler despite beginning stack failure...');
    arxivScheduler.startDailyRenewal(6);
    isInitialized = true;
    throw error; // Re-throw to let caller know there was an issue
  }
}

/**
 * Initialize services for development (run yesterday's papers immediately, then daily)
 */
export async function initializeServicesWithImmediateRun() {
  if (isInitialized) {
    console.log('Services already initialized, skipping...');
    return;
  }
  
  console.log('Initializing services with immediate run...');
  
  try {
    // Run yesterday's renewal immediately for testing
    console.log('Running immediate renewal (yesterday papers)...');
    await arxivScheduler.runRenewal();
    
    // Then start daily renewal at 6 AM UTC
    console.log('Starting daily renewal scheduler...');
    arxivScheduler.startDailyRenewal(6);
    
    isInitialized = true;
    console.log('Services initialized successfully with immediate run');
  } catch (error) {
    console.error('Error during immediate run initialization:', error);
    // Still start the scheduler even if immediate run fails
    console.log('Starting daily renewal scheduler despite immediate run failure...');
    arxivScheduler.startDailyRenewal(6);
    isInitialized = true;
    throw error;
  }
}

/**
 * Check if services are already initialized
 */
export function areServicesInitialized(): boolean {
  return isInitialized;
}

/**
 * Stop all services (useful for cleanup)
 */
export function stopServices() {
  arxivScheduler.stopDailyRenewal();
  isInitialized = false;
  console.log('All services stopped');
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetInitializationState() {
  isInitialized = false;
  console.log('Initialization state reset');
} 