import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('API: Reading Supabase env vars...')
  console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!url)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!key)

  if (!url || !key) {
    console.error('API: Missing Supabase configuration!')
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('supabase')))
  }

  return NextResponse.json({
    url: url || '',
    key: key || '',
    hasUrl: !!url,
    hasKey: !!key,
  })
}
