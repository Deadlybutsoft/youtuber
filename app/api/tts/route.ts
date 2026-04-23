import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, voice_id, elevenLabsKey } = await req.json();
  const apiKey = elevenLabsKey || process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }), { status: 500 });
  }

  if (!text) {
    return new Response(JSON.stringify({ error: 'text is required' }), { status: 400 });
  }

  const voiceId = voice_id || 'TX3LPaxmHKxFdv7VOQHJ'; // Default: Liam

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return new Response(
      JSON.stringify({ error: `ElevenLabs error: ${res.status}`, details: err, rate_limited: res.status === 429 || res.status === 401 }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(res.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
