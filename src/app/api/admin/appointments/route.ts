import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from '@/app/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true, price: true } },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
  }
}