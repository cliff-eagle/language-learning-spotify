import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCloudflareContext } from '@/lib/cloudflare';

export async function POST(request: NextRequest) {
  try {
    const { name, email, nativeLanguage, targetLanguage, currentLevel, desiredLevel, applicationContext, openaiApiKey } = await request.json();
    
    // Validate required fields
    if (!name || !nativeLanguage || !targetLanguage || !currentLevel || !desiredLevel || !applicationContext || !openaiApiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get database connection
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Generate unique ID for user
    const userId = uuidv4();
    
    // Insert user into database
    await db.prepare(
      `INSERT INTO users (id, name, email, native_language, target_language, current_level, desired_level, application_context, openai_api_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      name,
      email || null,
      nativeLanguage,
      targetLanguage,
      currentLevel,
      desiredLevel,
      applicationContext,
      openaiApiKey
    ).run();
    
    // Set user ID in cookie for session management
    const response = NextResponse.json({ success: true, userId });
    response.cookies.set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
