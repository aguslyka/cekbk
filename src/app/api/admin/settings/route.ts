import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_SETTINGS: Record<string, string> = {
  schoolName: 'SMP Negeri 1 Contoh',
  schoolAddress: 'Jl. Pendidikan No. 1, Kota Contoh',
  schoolPhone: '(021) 1234567',
  schoolLogo: '',
  bkCoordinator: 'Konselor Pendidikan',
  bkCoordinatorNip: '',
  schoolPrincipal: '',
  schoolPrincipalNip: '',
  academicYear: '2024/2025',
  schoolNpsn: '',
  schoolEmail: '',
  aiProvider: 'zai',
  aiApiKey: '',
  aiBaseUrl: '',
  aiModel: '',
};

async function getSettings() {
  const settings = await db.setting.findMany();
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const data = await req.json();

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        await db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
