import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import Stripe from 'stripe';

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
};

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID ist erforderlich' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if already connected
    if (tenant.stripeAccountId && tenant.stripeOnboardingStatus === 'completed') {
      return NextResponse.json({
        connected: true,
        accountId: tenant.stripeAccountId,
      });
    }

    // Create or retrieve Stripe Connect account
    let accountId = tenant.stripeAccountId;
    const stripe = getStripe();

    if (!accountId) {
      // Create new Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'AT',
        email: tenant.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Update tenant with account ID
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          stripeAccountId: accountId,
          stripeOnboardingStatus: 'pending',
        },
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/restaurants/${tenantId}?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/restaurants/${tenantId}?stripe_success=true`,
      type: 'account_onboarding',
    });

    // Update tenant with onboarding URL
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeOnboardingUrl: accountLink.url,
      },
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Stripe Accounts' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID ist erforderlich' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nicht gefunden' },
        { status: 404 }
      );
    }

    if (!tenant.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        status: 'not_connected',
      });
    }

    // Check account status
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(tenant.stripeAccountId);

      let onboardingStatus = tenant.stripeOnboardingStatus;
      if (account.details_submitted && account.charges_enabled) {
        onboardingStatus = 'completed';
        if (!tenant.stripeConnectedAt) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              stripeOnboardingStatus: 'completed',
              stripeConnectedAt: new Date(),
            },
          });
        }
      } else if (account.details_submitted === false) {
        onboardingStatus = 'pending';
      }

      return NextResponse.json({
        connected: onboardingStatus === 'completed',
        status: onboardingStatus,
        accountId: tenant.stripeAccountId,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
      });
    } catch (error) {
      console.error('Error retrieving Stripe account:', error);
      return NextResponse.json({
        connected: false,
        status: 'error',
      });
    }
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Prüfen des Stripe Status' },
      { status: 500 }
    );
  }
}

