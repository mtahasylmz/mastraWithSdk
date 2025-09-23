import { initializeServicesWithBeginningStack } from '../services/init';

// Global flag to ensure initialization only happens once per server process
// Using global to persist across module re-imports during development
declare global {
  var __MASTRA_SERVICES_INITIALIZED: boolean | undefined;
}

export async function startupServices() {
  // Check if already initialized
  if (global.__MASTRA_SERVICES_INITIALIZED) {
    console.log('⏭️ Services already initialized, skipping...');
    return;
  }

  try {
    console.log('🚀 Starting automatic service initialization...');
    console.log('🔍 Environment check:', {
      RUN_BEGINNING_STACK: process.env.RUN_BEGINNING_STACK,
      NODE_ENV: process.env.NODE_ENV,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasUpstash: !!process.env.UPSTASH_VECTOR_REST_URL
    });
    
    // Mark as initialized BEFORE starting to prevent race conditions
    global.__MASTRA_SERVICES_INITIALIZED = true;
    
    // Check if this is a fresh deployment or development
    const shouldRunBeginningStack = process.env.RUN_BEGINNING_STACK === 'true';
    
    if (shouldRunBeginningStack) {
      console.log('📚 Running beginning stack initialization...');
      await initializeServicesWithBeginningStack();
      console.log('✅ Automatic service initialization completed successfully');
    } else {
      console.log('No beginning stack to run, starting directly...');
    }
    
  } catch (error) {
    // Reset flag on error so it can be retried
    global.__MASTRA_SERVICES_INITIALIZED = false;
    console.error('❌ Error during automatic service initialization:', error);
    console.log('⚠️ Continuing without automatic initialization. Check your environment variables and restart the application.');
  }
}

// Only run initialization once per server process
if (typeof window === 'undefined' && !global.__MASTRA_SERVICES_INITIALIZED) { 
  console.log('🔧 Server startup detected, initializing services...');
  
  // Use setImmediate to run after current execution cycle
  setImmediate(() => {
    startupServices().catch(console.error);
  });
} 