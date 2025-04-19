import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userProfile = await getUserProfile();
    
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Don't send the API key back to the client for security
    const { openaiApiKey, ...safeUserData } = userProfile;
    
    return NextResponse.json(safeUserData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
