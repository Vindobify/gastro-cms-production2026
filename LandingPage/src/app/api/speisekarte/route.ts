import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const item = await prisma.speisekarte.findFirst()
    return NextResponse.json(item || {})
  } catch (e) {
    console.error(e)
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // convert empty strings to null for optional fields
    const data = {
      title: body.title || 'Unsere Speisekarte',
      imageUrl: body.imageUrl || null,
      pdfUrl: body.pdfUrl || null,
      description: body.description || null,
    }
    const existing = await prisma.speisekarte.findFirst()
    if (existing) {
      const updated = await prisma.speisekarte.update({ where: { id: existing.id }, data })
      return NextResponse.json(updated)
    }
    const created = await prisma.speisekarte.create({ data })
    return NextResponse.json(created)
  } catch (e) {
    console.error('Speisekarte save error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
