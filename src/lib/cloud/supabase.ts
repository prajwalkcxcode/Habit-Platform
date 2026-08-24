/**
 * Supabase Cloud Adapter — V4
 * This module creates a type-safe Supabase client ready for cloud sync.
 * Connection is entirely optional — the app works 100% offline via Dexie (IndexedDB).
 *
 * To enable cloud sync:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
 *   3. Run the schema SQL from src/lib/cloud/schema.sql
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isCloudEnabled = () =>
  typeof window !== 'undefined' &&
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0

export const supabase = isCloudEnabled()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export type CloudSyncStatus = 'disabled' | 'idle' | 'syncing' | 'error' | 'success'
