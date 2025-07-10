import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { serviceSchema } from '@/app/lib/validation';
import { getServerSession } from '@/app/lib/auth';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, duration, image, description } = serviceSchema
      .extend({
        image: z.string().url('Invalid image URL').optional(),
        description: z.string().optional(),
      })
      .parse(body);

    const stripeProduct = await stripe.products.create({
      name,
      images: image ? [image] : [],
      description: description || undefined,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100),
      currency: 'brl',
    });

    const service = await prisma.service.create({
      data: {
        name,
        price,
        duration,
        image,
        description,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error in POST /api/services:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Invalid input', details: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    if (!products.data.length) {
      console.warn('No active products found in Stripe');
      return NextResponse.json([]);
    }

    const services = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 1,
        });
        const price = prices.data[0];
        const service = await prisma.service.findFirst({
          where: { stripeProductId: product.id },
        });

        return {
          id: service?.id || null,
          name: product.name,
          price: price?.unit_amount ? price.unit_amount / 100 : 0,
          duration: service?.duration || 30,
          image: product.images[0] || null,
          description: product.description || null,
          stripeProductId: product.id,
          stripePriceId: price?.id || null,
          createdAt: service?.createdAt || new Date().toISOString(),
          updatedAt: service?.updatedAt || new Date().toISOString(),
        };
      })
    );

    console.log('Fetched Stripe products:', services);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error in GET /api/services:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error fetching services', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, price, duration, image, description } = serviceSchema
      .extend({
        id: z.number().int().positive(),
        image: z.string().url('Invalid image URL').optional(),
        description: z.string().optional(),
      })
      .parse(body);

    const existingService = await prisma.service.findUnique({ where: { id } });
    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    let stripePriceId = existingService.stripePriceId;
    if (existingService.price !== price || name !== existingService.name || image !== existingService.image || description !== existingService.description) {
      if (existingService.stripeProductId) {
        await stripe.products.update(existingService.stripeProductId, {
          name,
          images: image ? [image] : [],
          description: description || undefined,
        });
        if (existingService.price !== price) {
          const stripePrice = await stripe.prices.create({
            product: existingService.stripeProductId,
            unit_amount: Math.round(price * 100),
            currency: 'brl',
          });
          stripePriceId = stripePrice.id;
        }
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: { name, price, duration, image, description, stripePriceId },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error in PUT /api/services:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Invalid input', details: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id } });
    if (service?.stripeProductId) {
      await stripe.products.update(service.stripeProductId, { active: false });
    }

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/services:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error deleting service', details: errorMessage }, { status: 500 });
  }
}