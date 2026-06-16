import { supabase } from './supabase'
import { parseProfile } from '@/utils/profileMetadata'

export async function getProfileId(clerkUserId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  return data?.id ?? null
}

export async function verifyAdmin(clerkUserId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  if (!data) return false
  const parsed = parseProfile(data)
  return parsed.role === 'admin' || parsed.role === 'super_admin'
}