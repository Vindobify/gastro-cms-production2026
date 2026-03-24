import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const items = await prisma.slideshowImage.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await prisma.slideshowImage.create({ data })
  return NextResponse.json(item)
}
