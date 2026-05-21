import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PUBLIC_SETTINGS_KEYS = [
  'schoolName',
  'schoolAddress',
  'schoolPhone',
  'schoolLogo',
  'bkCoordinator',
  'academicYear',
  'schoolNpsn',
  'schoolEmail',
];

const DEFAULT_SETTINGS: Record<string, string> = {
  schoolName: 'SMP Negeri 1 Contoh',
  schoolAddress: 'Jl. Pendidikan No. 1, Kota Contoh',
  schoolPhone: '(021) 1234567',
  schoolLogo: '',
  bkCoordinator: 'Konselor Pendidikan',
  bkCoordinatorNip: '',
  academicYear: '2024/2025',
  schoolNpsn: '',
  schoolEmail: '',
};

export async function GET() {
  try {
    const settings = await db.setting.findMany({
      where: { key: { in: PUBLIC_SETTINGS_KEYS } },
    });
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    // Only return public-safe keys
    const publicResult: Record<string, string> = {};
    for (const key of PUBLIC_SETTINGS_KEYS) {
      publicResult[key] = result[key] || '';
    }
    return NextResponse.json({ settings: publicResult });
  } catch (error) {
    console.error('Public settings GET error:', error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}
