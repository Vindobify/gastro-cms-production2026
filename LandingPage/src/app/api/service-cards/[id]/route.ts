import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json(await prisma.serviceCard.update({ where: { id: parseInt(id) }, data: await req.json() }))
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.serviceCard.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
