import { NextRequest, NextResponse } from 'next/server';
import { generateTransliteration } from '@/lib/lyrics';
import { Script } from '@/lib/types/lyrics';
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
    const { processedLyrics, targetScript } = await request.json();
    
    if (!processedLyrics || !targetScript) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Validate target script
    if (!Object.values(Script).includes(targetScript as Script)) {
      return NextResponse.json({ error: 'Invalid target script' }, { status: 400 });
    }
    
    // Generate transliteration
    const updatedLyrics = await generateTransliteration(processedLyrics, targetScript as Script);
    
    return NextResponse.json(updatedLyrics);
  } catch (error) {
    console.error('Error generating transliteration:', error);
    return NextResponse.json({ error: 'Failed to generate transliteration' }, { status: 500 });
  }
}
