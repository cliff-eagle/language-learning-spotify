import { NextRequest, NextResponse } from 'next/server';
import { generateTranslation } from '@/lib/lyrics';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookies
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get request body
    const { processedLyrics, targetLanguage } = await request.json();
    
    if (!processedLyrics || !targetLanguage) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Generate translation
    const updatedLyrics = await generateTranslation(processedLyrics, targetLanguage);
    
    return NextResponse.json(updatedLyrics);
  } catch (error) {
    console.error('Error generating translation:', error);
    return NextResponse.json({ error: 'Failed to generate translation' }, { status: 500 });
  }
}
