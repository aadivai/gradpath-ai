import { supabase } from './supabase'

export async function getProfileId(clerkUserId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()
  return data?.id ?? null
}