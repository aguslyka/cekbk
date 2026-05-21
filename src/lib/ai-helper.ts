import { db } from '@/lib/db';

interface AIConfig {
  provider: 'zai' | 'openai' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

/**
 * Get AI configuration from database settings.
 * Falls back to Z AI Service if no config is set.
 */
export async function getAIConfig(): Promise<AIConfig> {
  const settings = await db.setting.findMany({
    where: {
      key: { in: ['aiProvider', 'aiApiKey', 'aiBaseUrl', 'aiModel'] },
    },
  });

  const config: Record<string, string> = {};
  for (const s of settings) {
    config[s.key] = s.value;
  }

  return {
    provider: (config.aiProvider as AIConfig['provider']) || 'zai',
    apiKey: config.aiApiKey || '',
    baseUrl: config.aiBaseUrl || '',
    model: config.aiModel || '',
  };
}

/**
 * Create a chat completion using the configured AI provider.
 * Supports Z AI Service (default), OpenAI Compatible, and Custom API.
 */
export async function createChatCompletion(messages: { role: string; content: string }[]): Promise<string> {
  const aiConfig = await getAIConfig();

  if (aiConfig.provider === 'zai') {
    // Use Z AI Service (built-in SDK)
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        model: 'default',
        messages: messages as Array<{ role: 'assistant' | 'user' | 'system'; content: string }>,
        thinking: { type: 'disabled' },
      });
      return completion.choices?.[0]?.message?.content || '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';

      // Check if this is a configuration error
      if (
        msg.includes('not found') ||
        msg.includes('not config') ||
        msg.includes('NOT_CONFIGURED') ||
        msg.includes('AI_NOT') ||
        msg.includes('belum') ||
        msg.includes('undefined') ||
        msg.includes('Failed to parse URL')
      ) {
        throw new Error(
          'Z AI Service tidak tersedia di lingkungan ini. ' +
          'Silakan ganti ke OpenAI Compatible atau Custom API di menu Pengaturan > Konfigurasi AI. ' +
          'Contoh: Gunakan Groq (gratis) dengan Base URL https://api.groq.com/openai/v1'
        );
      }

      throw new Error(`Z AI Service gagal: ${msg}`);
    }
  }

  // OpenAI Compatible or Custom API
  if (!aiConfig.apiKey) {
    throw new Error(
      'API Key belum dikonfigurasi. ' +
      'Silakan isi di Pengaturan > Konfigurasi AI > pilih OpenAI Compatible atau Custom API.'
    );
  }

  if (!aiConfig.baseUrl) {
    throw new Error(
      'Base URL belum dikonfigurasi. ' +
      'Silakan isi di Pengaturan > Konfigurasi AI. ' +
      'Contoh: https://api.groq.com/openai/v1 (Groq), https://api.openai.com/v1 (OpenAI)'
    );
  }

  // Clean up base URL - remove trailing slashes
  let cleanUrl = aiConfig.baseUrl.trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }

  // Determine the best model default based on base URL
  let effectiveModel = aiConfig.model || '';
  if (!effectiveModel) {
    if (aiConfig.baseUrl.includes('groq.com')) {
      effectiveModel = 'llama-3.3-70b-versatile';
    } else if (aiConfig.baseUrl.includes('openai.com')) {
      effectiveModel = 'gpt-3.5-turbo';
    } else {
      effectiveModel = 'gpt-3.5-turbo'; // Generic default
    }
  }

  const url = `${cleanUrl}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
      } catch {
        errorMsg += ` - ${errorText.substring(0, 200)}`;
      }

      const providerLabel = aiConfig.provider === 'openai' ? 'OpenAI Compatible' : 'Custom API';

      if (response.status === 401 || response.status === 403) {
        const isGroq = cleanUrl.includes('groq.com');
        throw new Error(
          `${providerLabel}: API Key tidak valid atau sudah expired (HTTP 403). ` +
          (isGroq
            ? 'Buat API Key baru di console.groq.com → API Keys → Create Key. Pastikan key dimulai dengan gsk_ dan masih aktif.'
            : 'Pastikan API Key sudah benar dan masih aktif.') +
          ` Detail: ${errorMsg}`
        );
      } else if (response.status === 404) {
        throw new Error(
          `${providerLabel}: Endpoint tidak ditemukan. Pastikan Base URL benar (contoh: https://api.groq.com/openai/v1). Detail: ${errorMsg}`
        );
      } else if (response.status === 400) {
        throw new Error(
          `${providerLabel}: Request tidak valid. Pastikan Model sudah benar. Detail: ${errorMsg}`
        );
      } else if (response.status === 429) {
        throw new Error(
          `${providerLabel}: Rate limit tercapai. Coba lagi beberapa saat. Detail: ${errorMsg}`
        );
      }

      throw new Error(`${providerLabel} error: ${errorMsg}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    clearTimeout(timeout);

    // Re-throw if already our custom error
    if (err instanceof Error && !err.message.includes('fetch') && !err.message.includes('abort') && !err.message.includes('ECONN')) {
      throw err;
    }

    const msg = err instanceof Error ? err.message : 'Unknown error';
    const providerLabel = aiConfig.provider === 'openai' ? 'OpenAI Compatible' : 'Custom API';

    if (msg.includes('abort') || msg.includes('timeout')) {
      throw new Error(`${providerLabel}: Koneksi timeout (30 detik). Server terlalu lama merespons.`);
    } else if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
      throw new Error(`${providerLabel}: Tidak dapat terhubung ke server. Pastikan Base URL benar.`);
    } else if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      throw new Error(`${providerLabel}: Domain tidak ditemukan. Pastikan Base URL benar.`);
    }

    throw new Error(`${providerLabel}: ${msg}`);
  }
}
