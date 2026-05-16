import { NextRequest, NextResponse } from 'next/server'

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return m ? m[1].trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url } = body
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Magiloom/1.0; +https://magiloom.com)' },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Could not fetch page (HTTP ${res.status})` }, { status: 422 })
    }
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Could not reach that URL' }, { status: 422 })
  }

  const title = extractTitle(html)
  const raw_text = stripHtml(html)
  const domain = parsedUrl.hostname.replace(/^www\./, '')
  const favicon_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  if (!raw_text.trim()) {
    return NextResponse.json({ error: 'Page has no readable text content' }, { status: 422 })
  }

  const magiciteUrl = process.env.MAGICITE_URL
  if (!magiciteUrl) {
    return NextResponse.json({ error: 'Clip service is not configured' }, { status: 503 })
  }

  const magiciteRes = await fetch(`${magiciteUrl}/clips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ url, title, domain, favicon_url, raw_text }),
  })

  if (!magiciteRes.ok) {
    const errBody = await magiciteRes.text().catch(() => '')
    return NextResponse.json(
      { error: errBody || `Clip service error (${magiciteRes.status})` },
      { status: magiciteRes.status }
    )
  }

  const data = await magiciteRes.json()
  return NextResponse.json(data, { status: 201 })
}
