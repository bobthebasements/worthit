import { NextResponse } from 'next/server';

async function getEbayToken() {
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return null;

  const basic = Buffer.from(`${id}:${secret}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token || null;
}

function cleanPrices(items) {
  return items
    .map((item) => Number(item.price?.value))
    .filter((price) => Number.isFinite(price) && price > 0);
}

function trimmedMedian(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const trim = sorted.length >= 10 ? Math.floor(sorted.length * 0.1) : 0;
  const usable = sorted.slice(trim, sorted.length - trim || undefined);
  const middle = Math.floor(usable.length / 2);
  return usable.length % 2 ? usable[middle] : (usable[middle - 1] + usable[middle]) / 2;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ source: 'none', message: 'Missing item query.' }, { status: 400 });

  const token = await getEbayToken();
  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      message: 'eBay data is not configured yet.',
    });
  }

  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '50');
  url.searchParams.set('filter', 'buyingOptions:{FIXED_PRICE},conditions:{USED|NEW}');

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
        'Accept-Language': 'en-GB',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ source: 'fallback', message: 'eBay market lookup failed.' });
    }

    const data = await response.json();
    const items = Array.isArray(data.itemSummaries) ? data.itemSummaries : [];
    const prices = cleanPrices(items);
    const median = trimmedMedian(prices);

    if (!median) {
      return NextResponse.json({ source: 'fallback', message: 'No usable eBay prices found.' });
    }

    const low = Math.round(Math.min(...prices) / 5) * 5;
    const high = Math.round(Math.max(...prices) / 5) * 5;

    return NextResponse.json({
      source: 'ebay-live',
      marketplace: 'eBay UK',
      listingCount: items.length,
      median: Math.round(median / 5) * 5,
      low: Math.max(5, low),
      high: Math.max(5, high),
      note: 'Based on current eBay UK listings. Active listing prices are not the same as completed sale prices.',
    });
  } catch {
    return NextResponse.json({ source: 'fallback', message: 'Market lookup unavailable.' });
  }
}
