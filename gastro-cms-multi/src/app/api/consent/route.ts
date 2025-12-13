/**
 * API Route für Consent-Logging (optional)
 * Protokolliert nur Consent-Status, keine personenbezogenen Daten
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseConsentFromCookie } from '@/lib/consent'

export async function POST(request: NextRequest) {
  try {
    // Consent-Cookie aus Request lesen
    const cookieHeader = request.headers.get('cookie')
    const consent = parseConsentFromCookie(cookieHeader)
    
    if (!consent) {
      return NextResponse.json({ error: 'Kein Consent-Cookie gefunden' }, { status: 400 })
    }

    // Nur Consent-Status loggen (keine personenbezogenen Daten)
    const logData = {
      timestamp: new Date().toISOString(),
      consent_version: consent.v,
      consent_timestamp: consent.t,
      categories: {
        essential: consent.categories.essential,
        analytics: consent.categories.analytics,
        marketing: consent.categories.marketing,
      },
      user_agent: request.headers.get('user-agent')?.substring(0, 100), // Gekürzt
      ip_hash: null, // Keine IP-Speicherung
    }

    // Hier könnte eine Datenbank-Logging-Implementierung stehen
    console.log('Consent-Status:', logData)

    return NextResponse.json({ 
      success: true, 
      message: 'Consent-Status protokolliert' 
    })

  } catch (error) {
    console.error('Fehler beim Consent-Logging:', error)
    return NextResponse.json(
      { error: 'Interner Server-Fehler' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Consent-API ist aktiv',
    version: '1.0',
    compliance: 'DSGVO-konform'
  })
}
