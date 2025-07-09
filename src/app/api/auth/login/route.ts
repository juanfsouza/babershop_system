import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { loginSchema } from '@/app/lib/validation';
import { comparePassword, generateToken } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciais invalido' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciais invalido' }, { status: 401 });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Input invalido' }, { status: 400 });
  }
}