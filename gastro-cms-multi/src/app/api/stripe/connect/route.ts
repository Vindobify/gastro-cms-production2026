import { NextRequest, NextResponse } from 'next/server';
import { getTenantOrThrow } from '@/lib/tenant';

const CRM_URL = process.env.CRM_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantOrThrow();

    // Forward request to CRM
    const response = await fetch(`${CRM_URL}/api/stripe/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth token if available
        Cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ tenantId: tenant.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error connecting to Stripe:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verbinden mit Stripe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenant = await getTenantOrThrow();

    // Forward request to CRM
    const response = await fetch(`${CRM_URL}/api/stripe/connect?tenantId=${tenant.id}`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Prüfen des Stripe Status' },
      { status: 500 }
    );
  }
}

