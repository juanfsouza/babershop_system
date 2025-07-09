import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from '@/app/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!appointment.service.stripePriceId) {
      return NextResponse.json({ error: 'Service does not have a Stripe price ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: appointment.service.stripePriceId as string,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      metadata: { appointmentId: appointment.id.toString() },
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error in POST /api/appointments/pay:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error creating payment session', details: errorMessage }, { status: 500 });
  }
}