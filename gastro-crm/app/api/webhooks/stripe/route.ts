import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        // Find tenant by stripeAccountId
        const tenant = await prisma.tenant.findFirst({
          where: { stripeAccountId: account.id },
        });

        if (tenant) {
          const updateData: any = {};

          if (account.details_submitted && account.charges_enabled) {
            updateData.stripeOnboardingStatus = 'completed';
            if (!tenant.stripeConnectedAt) {
              updateData.stripeConnectedAt = new Date();
            }
          } else if (!account.details_submitted) {
            updateData.stripeOnboardingStatus = 'pending';
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.tenant.update({
              where: { id: tenant.id },
              data: updateData,
            });
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle checkout completion if needed
        console.log('Checkout session completed:', session.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Handle payment success if needed
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

