import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { registerSchema } from '@/app/lib/validation';
import { hashPassword, generateToken } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'CLIENT',
      },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ user: { id: user.id, name, email, phone, role: user.role }, token });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}