import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { scheduleSchema } from '@/app/lib/validation';
import { getServerSession } from '@/app/lib/auth';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isAvailable } = scheduleSchema.parse(body);

    const schedule = await prisma.schedule.create({
      data: { dayOfWeek, startTime, endTime, isAvailable },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const schedules = await prisma.schedule.findMany();
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching schedules' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, dayOfWeek, startTime, endTime, isAvailable } = scheduleSchema.extend({ id: z.number().int().positive() }).parse(body);

    const schedule = await prisma.schedule.update({
      where: { id },
      data: { dayOfWeek, startTime, endTime, isAvailable },
    });

    return NextResponse.json(schedule);
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

    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ message: 'Schedule deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting schedule' }, { status: 500 });
  }
}