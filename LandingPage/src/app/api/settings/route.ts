import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const settings = await prisma.settings.findMany()
  return NextResponse.json(settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string | null>))
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      })
    )
  )
  return NextResponse.json({ success: true })
}
