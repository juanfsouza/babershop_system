import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/app/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing stripe-signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = parseInt(session.metadata?.appointmentId || '0');
        if (appointmentId) {
          await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CONFIRMED' },
          });
        }
        break;

      case 'price.created':
      case 'price.updated':
        const price = event.data.object as Stripe.Price;
        const service = await prisma.service.findFirst({
          where: { stripePriceId: price.id },
        });
        if (service) {
          await prisma.service.update({
            where: { id: service.id },
            data: { price: price.unit_amount ? price.unit_amount / 100 : service.price },
          });
        }
        break;

      case 'product.created':
        const product = event.data.object as Stripe.Product;
        console.log('New Stripe product created:', product);
        break;

      case 'product.updated':
        const updatedProduct = event.data.object as Stripe.Product;
        const updatedService = await prisma.service.findFirst({
          where: { stripeProductId: updatedProduct.id },
        });
        if (updatedService) {
          await prisma.service.update({
            where: { id: updatedService.id },
            data: { name: updatedProduct.name },
          });
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error handling webhook', details: errorMessage }, { status: 500 });
  }
}