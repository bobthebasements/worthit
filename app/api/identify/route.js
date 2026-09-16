import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'Groq AI is not configured. Add GROQ_API_KEY in Vercel.' }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get('image');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No image was uploaded.' }, { status: 400 });
    }

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload an image.' }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Please use an image smaller than 8MB.' }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const imageUrl = `data:${file.type};base64,${bytes.toString('base64')}`;

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: 'You identify second-hand items for a UK resale valuation app. Never invent a price. Be conservative: if the exact model cannot be established from the image, return the closest defensible identification and lower confidence. Return only valid JSON matching the requested structure.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Identify the item shown in this photo for UK resale marketplaces.

Return JSON with exactly these keys:
{
  "brand": string,
  "product": string,
  "model": string,
  "variant": string,
  "condition": "new" | "like_new" | "good" | "fair" | "unknown",
  "accessories": string[],
  "searchQueries": string[],
  "confidence": number
}

Use "unknown" or an empty string when you cannot establish something. Give 2-4 useful search queries. Do not include a price.`,
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 1200,
      top_p: 0.95,
      stream: false,
      reasoning_effort: 'default',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return NextResponse.json({
      ...parsed,
      searchQueries: Array.isArray(parsed.searchQueries) ? parsed.searchQueries.slice(0, 4) : [],
      accessories: Array.isArray(parsed.accessories) ? parsed.accessories : [],
    });
  } catch (error) {
    console.error('Groq identification error:', error);
    return NextResponse.json({ error: 'The image could not be identified. Try a clearer photo.' }, { status: 500 });
  }
}
