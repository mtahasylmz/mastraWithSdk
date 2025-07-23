import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/upstash-ratelimit';


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { error: 'Missing id parameter' }, 
                { status: 400 }
            );
        }
        
        const isLimited = await isRateLimited(id);
        
        return NextResponse.json({ 
            isLimited,
            success: !isLimited 
        });
        
    } catch (error) {
        console.error('Rate limit check failed:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}