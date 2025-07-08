import { initializeServicesWithBeginningStack } from '../services/init';

// Ensure environment variables are loaded
if (typeof window === 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
    require('dotenv').config({ path: '.env' });
  } catch (error) {
    // dotenv might not be available in production, that's ok
  }
}


export async function startupServices() {
  try {
    console.log('🚀 Starting automatic service initialization...');
    console.log('🔍 Environment check:', {
      RUN_BEGINNING_STACK: process.env.RUN_BEGINNING_STACK,
      NODE_ENV: process.env.NODE_ENV,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasUpstash: !!process.env.UPSTASH_VECTOR_REST_URL
    });
    
    // Check if this is a fresh deployment or development
    const shouldRunBeginningStack = process.env.RUN_BEGINNING_STACK === 'true';
    
    if (shouldRunBeginningStack) {
      console.log('📚 Running beginning stack initialization...');
      await initializeServicesWithBeginningStack();
      console.log('✅ Automatic service initialization completed successfully');
    } else {
      console.log('⏰ Starting scheduler-only initialization...');
      const { initializeServices } = await import('../services/init');
      initializeServices();
      console.log('✅ Scheduler initialized successfully');
    }
    
  } catch (error) {
    console.error('❌ Error during automatic service initialization:', error);
    // Don't crash the app, just log the error
    console.log('⚠️ Continuing without automatic initialization. Check your environment variables and restart the application.');
  }
}

// Auto-run on import - trigger in both development and production
if (typeof window === 'undefined') { 
  console.log('🔧 Server-side startup detected, initializing services...');
  
  // Use setImmediate to run after current execution cycle
  setImmediate(() => {
    startupServices().catch(console.error);
  });
} 