import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH — Update user profile (WhatsApp)
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const { whatsapp } = body;

    const user = await db.user.update({
      where: { id: userId },
      data: {
        whatsapp: whatsapp || null,
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// DELETE — Delete user account and all related data
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Prevent admin from deleting themselves
    if (userRole === 'ADMIN') {
      return NextResponse.json({ error: 'Akun admin tidak dapat dihapus' }, { status: 403 });
    }

    // Delete user (cascade will delete responses, answers, counselings)
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Akun berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
