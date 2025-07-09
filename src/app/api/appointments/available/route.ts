import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
    const schedule = await prisma.schedule.findFirst({
      where: { dayOfWeek, isAvailable: true },
    });

    if (!schedule) {
      return NextResponse.json({ availableSlots: [] });
    }

    const slots = [];
    let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    while (startHour < endHour || (startHour === endHour && startMinute <= endMinute)) {
      const time = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      slots.push(time);
      startMinute += 30;
      if (startMinute >= 60) {
        startHour++;
        startMinute = 0;
      }
    }

    const bookedSlots = await prisma.appointment.findMany({
      where: { date: new Date(date), status: { not: 'CANCELLED' } },
      select: { time: true },
    });

    const availableSlots = slots.filter(
      (slot) => !bookedSlots.some((booked) => booked.time === slot),
    );

    return NextResponse.json({ availableSlots });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching available slots' }, { status: 500 });
  }
}