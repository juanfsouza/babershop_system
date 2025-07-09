import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { appointmentSchema } from '@/app/lib/validation';
import { getServerSession } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, date, time } = appointmentSchema.parse(body);

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: `Service with ID ${serviceId} not found` }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { id: user.id } });
    if (!userExists) {
      return NextResponse.json({ error: `User with ID ${user.id} not found` }, { status: 400 });
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: { date: new Date(date.split('-').reverse().join('-')), time, status: { not: 'CANCELLED' } },
    });
    if (existingAppointment) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        serviceId,
        date: new Date(date.split('-').reverse().join('-')),
        time,
        status: 'PENDING',
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error in POST /api/appointments:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Invalid input', details: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: { service: { select: { name: true, price: true } } },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error fetching appointments', details: errorMessage }, { status: 500 });
  }
}