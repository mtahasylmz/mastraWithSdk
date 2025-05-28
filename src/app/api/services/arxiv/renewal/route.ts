import { NextResponse } from 'next/server';
import { fetchAndUpsertYesterday, fetchBeginningStack } from '../../../../../services/arxiv';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'yesterday';
    
    if (type === 'yesterday') {
      await fetchAndUpsertYesterday();
      return NextResponse.json({ 
        success: true, 
        message: 'Yesterday\'s papers fetched and stored successfully' 
      });
    } else if (type === 'beginning-stack') {
      await fetchBeginningStack();
      return NextResponse.json({ 
        success: true, 
        message: 'Beginning stack papers fetched and stored successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid type parameter. Use "yesterday" or "beginning-stack"' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in arxiv renewal:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch and store papers' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Arxiv renewal service',
    endpoints: {
      'POST /?type=yesterday': 'Fetch and store ALL of yesterday\'s papers',
      'POST /?type=beginning-stack': 'Fetch and store up to 1000 beginning stack papers'
    }
  });
} 