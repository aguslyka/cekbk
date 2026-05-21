import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion } from '@/lib/ai-helper';

const SYSTEM_PROMPT = `Kamu adalah seorang ahli Bimbingan Konseling (BK) di sekolah menengah pertama (SMP) di Indonesia. Kamu akan diberikan topik/topik ringkasan masalah siswa. Berikan respons dalam format berikut:

### CATATAN
[Tulis catatan profesional tentang masalah siswa berdasarkan topik yang diberikan]

### TINDAK LANJUT
[Tulis rekomendasi tindak lanjut yang harus dilakukan oleh Guru BK]

### SOLUSI
[Tulis solusi dan strategi yang dapat diterapkan untuk membantu siswa mengatasi masalahnya]`;

function parseAIResponse(text: string): {
  catatan: string;
  tindakLanjut: string;
  solusi: string;
} {
  const catatanMatch = text.split('### CATATAN');
  const tindakLanjutMatch = text.split('### TINDAK LANJUT');
  const solusiMatch = text.split('### SOLUSI');

  const catatan = catatanMatch.length > 1
    ? catatanMatch[1].split('### TINDAK LANJUT')[0].trim()
    : '';

  const tindakLanjut = tindakLanjutMatch.length > 1
    ? tindakLanjutMatch[1].split('### SOLUSI')[0].trim()
    : '';

  const solusi = solusiMatch.length > 1
    ? solusiMatch[1].trim()
    : '';

  return { catatan, tindakLanjut, solusi };
}

export async function POST(req: NextRequest) {
  try {
    // Check admin role
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { topic, field } = body as { topic: string; field?: string };

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return NextResponse.json(
        { error: 'Topik konseling wajib diisi' },
        { status: 400 }
      );
    }

    // Build user prompt
    let userPrompt = `Topik masalah siswa: ${topic.trim()}`;
    if (field && field.trim() !== '') {
      userPrompt += `\nBidang: ${field.trim()}`;
    }

    // Call AI via shared helper (supports Z AI, OpenAI, Custom)
    const responseText = await createChatCompletion([
      { role: 'assistant', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    if (!responseText) {
      return NextResponse.json(
        { error: 'Gagal menghasilkan saran dari AI' },
        { status: 500 }
      );
    }

    // Parse the structured response
    const parsed = parseAIResponse(responseText);

    if (!parsed.catatan && !parsed.tindakLanjut && !parsed.solusi) {
      return NextResponse.json(
        { error: 'Format respons AI tidak valid' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI suggest error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
