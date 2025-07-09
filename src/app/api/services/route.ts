import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { serviceSchema } from '@/app/lib/validation';
import { getServerSession } from '@/app/lib/auth';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, duration } = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: { name, price, duration },
    });

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.service.findMany();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, price, duration } = serviceSchema.extend({ id: z.number().int().positive() }).parse(body);

    const service = await prisma.service.update({
      where: { id },
      data: { name, price, duration },
    });

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
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

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
  }
}