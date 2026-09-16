import { NextResponse } from 'next/server';

async function getEbayToken() {
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const basic = Buffer.from(`${id}:${secret}`).toString('base64');
  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return (await response.json()).access_token || null;
}

function pricesFromItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => Number(item?.price?.value ?? item?.price_gbp ?? item?.price ?? item?.priceGBP))
    .filter((price) => Number.isFinite(price) && price > 0);
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const trim = sorted.length >= 10 ? Math.floor(sorted.length * 0.1) : 0;
  const usable = sorted.slice(trim, sorted.length - trim || undefined);
  const middle = Math.floor(usable.length / 2);
  return usable.length % 2 ? usable[middle] : (usable[middle - 1] + usable[middle]) / 2;
}

function sourceStats(name, prices, note) {
  if (!prices.length) return { name, status: 'unavailable', count: 0, note };
  return {
    name,
    status: 'live',
    count: prices.length,
    median: Math.round(median(prices) / 5) * 5,
    low: Math.max(5, Math.round(Math.min(...prices) / 5) * 5),
    high: Math.max(5, Math.round(Math.max(...prices) / 5) * 5),
    note,
  };
}

async function getEbay(query) {
  const token = await getEbayToken();
  if (!token) return sourceStats('eBay', [], 'Add EBAY_CLIENT_ID and EBAY_CLIENT_SECRET to enable live eBay UK listings.');
  const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '50');
  url.searchParams.set('filter', 'buyingOptions:{FIXED_PRICE},conditions:{USED|NEW}');
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB', 'Accept-Language': 'en-GB' }, cache: 'no-store' });
    if (!response.ok) return sourceStats('eBay', [], 'eBay returned an error for this search.');
    const data = await response.json();
    return sourceStats('eBay', pricesFromItems(data.itemSummaries), 'Current eBay UK asking prices. These are active listings, not completed sales.');
  } catch {
    return sourceStats('eBay', [], 'eBay lookup is temporarily unavailable.');
  }
}

async function getProxySource(name, query, envUrl, envKey, note) {
  const base = process.env[envUrl];
  const key = process.env[envKey];
  if (!base || !key) return sourceStats(name, [], `Connect a supported ${name} data provider to enable live ${name} prices.`);
  try {
    const url = new URL(base);
    url.searchParams.set('q', query);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}`, 'X-API-Key': key, Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) return sourceStats(name, [], `${name} data provider returned an error.`);
    const data = await response.json();
    const items = data.items || data.listings || data.results || data.data || [];
    return sourceStats(name, pricesFromItems(items), note);
  } catch {
    return sourceStats(name, [], `${name} data provider is temporarily unavailable.`);
  }
}

export async function GET(request) {
  const query = new URL(request.url).searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ source: 'none', message: 'Missing item query.' }, { status: 400 });

  const [ebay, vinted, facebook] = await Promise.all([
    getEbay(query),
    getProxySource('Vinted', query, 'VINTED_MARKET_API_URL', 'VINTED_MARKET_API_KEY', 'Current Vinted UK asking prices.'),
    getProxySource('Facebook Marketplace', query, 'FACEBOOK_MARKET_API_URL', 'FACEBOOK_MARKET_API_KEY', 'Current Facebook Marketplace asking prices where the connected provider supports UK Marketplace search.'),
  ]);

  const live = [ebay, vinted, facebook].filter((source) => source.status === 'live');
  const estimate = median(live.map((source) => source.median));

  return NextResponse.json({
    source: live.length ? 'multi-market' : 'none',
    estimate: estimate ? Math.round(estimate / 5) * 5 : null,
    sources: [ebay, vinted, facebook],
    liveSourceCount: live.length,
    note: live.length
      ? 'WorthIt compares live marketplace asking prices. Completed-sale data will be added separately where platform access permits it.'
      : 'No live marketplace providers are connected yet. WorthIt does not invent marketplace prices.',
  });
}
