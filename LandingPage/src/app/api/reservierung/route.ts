import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'
import { reservationFormSchema } from '@/lib/reservationSchema'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reservationFormSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors
      const msg = Object.values(first).flat()[0] || 'Ungueltige Eingaben'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const { name, phone, email, persons, date, time, message } = parsed.data
    const personCount =
      persons === 'mehr' ? 11 : Math.min(99, Math.max(1, parseInt(persons, 10) || 0))

    // Save to DB
    const reservation = await prisma.reservation.create({
      data: { name, phone, email, persons: personCount, date, time, message },
    })

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"Pizzeria Da Corrado" <${process.env.SMTP_FROM}>`,
        to: process.env.SMTP_TO,
        subject: `Neue Tischreservierung von ${name}`,
        headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        html: `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head><body>
          <h2>Neue Tischreservierung</h2>
          <table>
            <tr><td><strong>Name:</strong></td><td>${escapeHtml(name)}</td></tr>
            <tr><td><strong>Telefon:</strong></td><td>${escapeHtml(phone)}</td></tr>
            <tr><td><strong>E-Mail:</strong></td><td>${escapeHtml(email)}</td></tr>
            <tr><td><strong>Personen:</strong></td><td>${escapeHtml(String(persons))}</td></tr>
            <tr><td><strong>Datum:</strong></td><td>${escapeHtml(date)}</td></tr>
            <tr><td><strong>Uhrzeit:</strong></td><td>${escapeHtml(time)}</td></tr>
            ${message ? `<tr><td><strong>Nachricht:</strong></td><td>${escapeHtml(message)}</td></tr>` : ''}
          </table>
        </body></html>`,
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
    }

    return NextResponse.json({ success: true, id: reservation.id })
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reservations)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
