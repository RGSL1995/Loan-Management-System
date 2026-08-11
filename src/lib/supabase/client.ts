import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null
let configPromise: Promise<{ url: string; key: string }> | null = null

async function loadConfig() {
  // Try env vars first (for local dev)
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey }
  }

  // Fall back to runtime API (for Railway where env vars aren't available at build time)
  if (typeof window === 'undefined') {
    throw new Error('Cannot create browser client on server')
  }

  try {
    const response = await fetch('/api/config/supabase')
    const config = await response.json()
    return config
  } catch (err) {
    console.error('Failed to load Supabase config from API:', err)
    return { url: '', key: '' }
  }
}

export async function createClient() {
  if (cachedClient) return cachedClient

  if (!configPromise) {
    configPromise = loadConfig()
  }

  const { url, key } = await configPromise

  if (!url || !key) {
    console.error(
      'Supabase configuration error: URL and Key are not available.\n' +
      'Visit: /env-check for details.'
    )
  }

  cachedClient = createBrowserClient(url, key)
  return cachedClient
}
