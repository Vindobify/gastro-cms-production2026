import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await prisma.socialMedia.findMany({ orderBy: { order: 'asc' } }))
}

export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.socialMedia.create({ data: await req.json() }))
}
