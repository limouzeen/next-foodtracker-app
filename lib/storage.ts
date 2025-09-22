import { supabase } from './supabaseClient';

export function publicUrl(bucket: 'user_bk'|'food_bk', path: string | null | undefined) {
  if (!path) return '';
  return supabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
