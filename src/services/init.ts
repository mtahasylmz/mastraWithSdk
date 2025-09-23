import { fetchAndUpsertYesterday, fetchBeginningStack } from './arxiv';

let isInitialized = false;


export async function initializeServicesWithBeginningStack() {
  if (isInitialized) {
    console.log('Services already initialized, skipping...');
    return;
  }  
  try {
    console.log('Fetching beginning stack (this may take a few minutes)...');
    await fetchBeginningStack();
    console.log('Beginning stack fetch completed successfully');
    isInitialized = true;
    console.log('Services initialized successfully with beginning stack');
  } catch (error) {
    console.error('Error during beginning stack initialization:', error);
    console.log('Starting the server despite beginning stack failure...');
    isInitialized = true;
    throw error; // Re-throw to let caller know there was an issue
  }
}

