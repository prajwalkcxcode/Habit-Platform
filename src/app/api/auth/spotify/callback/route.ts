import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/music?error=${encodeURIComponent(error || 'cancelled')}`)
  }

  // Pass code to the frontend music page to finalize authentication
  return NextResponse.redirect(`${origin}/music?spotify_code=${encodeURIComponent(code)}`)
}
