import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, grade, whatsapp, jenisKelamin } = await req.json();

    if (!name || !email || !password || !grade || !whatsapp || !jenisKelamin) {
      return NextResponse.json({ error: 'Semua field wajib diisi (nama, email, WhatsApp, jenis kelamin, kelas, password)' }, { status: 400 });
    }

    if (![7, 8, 9].includes(Number(grade))) {
      return NextResponse.json({ error: 'Kelas harus 7, 8, atau 9' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        grade: Number(grade),
        whatsapp,
        jenisKelamin,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        jenisKelamin: true,
        grade: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: { ...user, createdAt: user.createdAt.toISOString() } });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
