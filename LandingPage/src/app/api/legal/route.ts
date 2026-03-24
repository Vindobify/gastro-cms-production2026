import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const pages = await prisma.legalPage.findMany()
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const { type, content } = await req.json()
  return NextResponse.json(await prisma.legalPage.upsert({
    where: { type },
    update: { content },
    create: { type, content },
  }))
}
