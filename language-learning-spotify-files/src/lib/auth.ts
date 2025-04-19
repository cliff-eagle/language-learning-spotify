import { cookies } from 'next/headers';
import { getCloudflareContext } from '@/lib/cloudflare';
import { UserProfile } from '@/lib/types';

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return null;
    }
    
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    const user = await db.prepare(
      `SELECT id, name, email, native_language as nativeLanguage, 
       target_language as targetLanguage, current_level as currentLevel, 
       desired_level as desiredLevel, application_context as applicationContext, 
       openai_api_key as openaiApiKey, created_at as createdAt
       FROM users WHERE id = ?`
    ).bind(userId).first();
    
    if (!user) {
      return null;
    }
    
    return user as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return false;
    }
    
    const { env } = getCloudflareContext();
    const db = env.DB;
    
    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (data.name) {
      updateFields.push('name = ?');
      values.push(data.name);
    }
    
    if (data.email) {
      updateFields.push('email = ?');
      values.push(data.email);
    }
    
    if (data.nativeLanguage) {
      updateFields.push('native_language = ?');
      values.push(data.nativeLanguage);
    }
    
    if (data.targetLanguage) {
      updateFields.push('target_language = ?');
      values.push(data.targetLanguage);
    }
    
    if (data.currentLevel) {
      updateFields.push('current_level = ?');
      values.push(data.currentLevel);
    }
    
    if (data.desiredLevel) {
      updateFields.push('desired_level = ?');
      values.push(data.desiredLevel);
    }
    
    if (data.applicationContext) {
      updateFields.push('application_context = ?');
      values.push(data.applicationContext);
    }
    
    if (data.openaiApiKey) {
      updateFields.push('openai_api_key = ?');
      values.push(data.openaiApiKey);
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    // Add userId to values array
    values.push(userId);
    
    await db.prepare(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...values).run();
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}
