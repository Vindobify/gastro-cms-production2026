import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

function maskSecret(secret: string): string {
  if (secret.length <= 8) return '****';
  return secret.substring(0, 4) + '...' + secret.substring(secret.length - 4);
}

export async function GET() {
  try {
    await requireAuth();

    // Return current environment variables (masked for security)
    // In production, these should be read from environment or secure storage
    return NextResponse.json({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ? maskSecret(process.env.STRIPE_SECRET_KEY) : '',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? maskSecret(process.env.STRIPE_PUBLISHABLE_KEY) : '',
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? maskSecret(process.env.STRIPE_WEBHOOK_SECRET) : '',
      stripeClientId: process.env.STRIPE_CLIENT_ID || '',
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    });
  } catch (error) {
    console.error('Error reading Stripe settings:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Stripe-Einstellungen' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const {
      stripeSecretKey,
      stripePublishableKey,
      stripeWebhookSecret,
      stripeClientId,
      nextPublicAppUrl,
    } = body;

    // Validate required fields
    if (!stripeSecretKey || !stripeWebhookSecret || !nextPublicAppUrl) {
      return NextResponse.json(
        { error: 'Stripe Secret Key, Webhook Secret und App URL sind erforderlich' },
        { status: 400 }
      );
    }

    // Validate key formats
    if (!stripeSecretKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Stripe Secret Key muss mit "sk_" beginnen' },
        { status: 400 }
      );
    }

    if (stripePublishableKey && !stripePublishableKey.startsWith('pk_')) {
      return NextResponse.json(
        { error: 'Stripe Publishable Key muss mit "pk_" beginnen' },
        { status: 400 }
      );
    }

    if (!stripeWebhookSecret.startsWith('whsec_')) {
      return NextResponse.json(
        { error: 'Stripe Webhook Secret muss mit "whsec_" beginnen' },
        { status: 400 }
      );
    }

    // Try to write to .env.local file (for local development)
    // In production/Docker, these should be set via environment variables
    const envPath = join(process.cwd(), '.env.local');
    
    try {
      let envContent = '';
      const otherLines: string[] = [];
      const stripeLines: string[] = [];

      // Read existing file if it exists
      if (existsSync(envPath)) {
        envContent = await readFile(envPath, 'utf-8');
        
        // Parse existing content
        envContent.split('\n').forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key] = trimmed.split('=');
            if (key) {
              const keyTrimmed = key.trim();
              if (!['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_CLIENT_ID', 'NEXT_PUBLIC_APP_URL'].includes(keyTrimmed)) {
                otherLines.push(line);
              }
            } else {
              otherLines.push(line);
            }
          } else if (trimmed) {
            otherLines.push(line);
          }
        });
      }

      // Add Stripe variables
      stripeLines.push(`STRIPE_SECRET_KEY=${stripeSecretKey}`);
      if (stripePublishableKey) {
        stripeLines.push(`STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}`);
      }
      stripeLines.push(`STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}`);
      if (stripeClientId) {
        stripeLines.push(`STRIPE_CLIENT_ID=${stripeClientId}`);
      }
      stripeLines.push(`NEXT_PUBLIC_APP_URL=${nextPublicAppUrl}`);

      // Write back to .env.local
      const allLines = [...otherLines, '', '# Stripe Configuration', ...stripeLines];
      await writeFile(envPath, allLines.join('\n') + '\n', 'utf-8');
    } catch (fileError) {
      // If file write fails (e.g., in Docker), just log it
      console.warn('Could not write to .env.local file:', fileError);
      // In Docker/production, environment variables should be set via docker-compose or deployment config
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe-Einstellungen erfolgreich gespeichert. Bitte starten Sie den Server neu, damit die Änderungen wirksam werden. In Docker-Umgebungen müssen die Umgebungsvariablen auch in der docker-compose.yml gesetzt werden.',
    });
  } catch (error) {
    console.error('Error saving Stripe settings:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Stripe-Einstellungen' },
      { status: 500 }
    );
  }
}

