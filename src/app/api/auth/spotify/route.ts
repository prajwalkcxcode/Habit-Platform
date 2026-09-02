import { NextResponse } from 'next/server'
import { getSpotifyAuthUrl } from '@/lib/music/spotify'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const redirectUri = `${origin}/api/auth/spotify/callback`
  const authUrl = getSpotifyAuthUrl(redirectUri)
  return NextResponse.redirect(authUrl)
}
