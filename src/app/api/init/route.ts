import { NextResponse } from 'next/server';
import { 
  initializeServices, 
  initializeServicesWithImmediateRun, 
  initializeServicesWithBeginningStack,
  areServicesInitialized 
} from '../../../services/init';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const immediate = searchParams.get('immediate') === 'true';
    const beginningStack = searchParams.get('beginning-stack') === 'true';
    
    if (areServicesInitialized()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Services already initialized' 
      });
    }
    
    if (beginningStack) {
      console.log('Starting initialization with beginning stack...');
      await initializeServicesWithBeginningStack();
      return NextResponse.json({ 
        success: true, 
        message: 'Services initialized successfully with beginning stack (1000 papers fetched)' 
      });
    } else if (immediate) {
      console.log('Starting initialization with immediate run...');
      await initializeServicesWithImmediateRun();
      return NextResponse.json({ 
        success: true, 
        message: 'Services initialized successfully with immediate run (yesterday papers)' 
      });
    } else {
      console.log('Starting basic initialization...');
      initializeServices();
      return NextResponse.json({ 
        success: true, 
        message: 'Services initialized successfully (scheduler only)' 
      });
    }
    
  } catch (error) {
    console.error('Error initializing services:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize services: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Service initialization endpoint',
    initialized: areServicesInitialized(),
    usage: {
      'POST /': 'Initialize daily renewal scheduler only',
      'POST /?immediate=true': 'Run yesterday papers + start daily scheduler',
      'POST /?beginning-stack=true': 'Fetch beginning stack (1000 papers) + start daily scheduler (RECOMMENDED FOR FIRST RUN)'
    },
    recommendations: {
      'First time setup': 'Use /?beginning-stack=true to populate database',
      'Development': 'Use /?immediate=true to test with recent data',
      'Production restart': 'Use / for scheduler-only restart'
    }
  });
} 