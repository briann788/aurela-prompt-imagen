// Vercel Edge Function — reads geolocation header injected by Vercel's edge network
// and returns the buyer's market segment ("local" for Indonesia, "intl" otherwise).
//
// Header source: x-vercel-ip-country (free on all Vercel plans, no external API needed)
// Free quota: 1M function invocations/month on Hobby (way more than enough)
// Latency: <50ms — country code is already in the request header, no lookup needed.

export const config = { runtime: 'edge' };

export default function handler(request) {
  // Vercel injects this header at the edge based on the requester's IP
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();

  // Indonesia → local market (IDR, Lynk.id)
  // Everything else → intl market (USD, Gumroad + PayPal via WhatsApp)
  const market = country === 'ID' ? 'local' : 'intl';

  return new Response(
    JSON.stringify({ country, market }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // Don't cache at the CDN — geo result is per-IP and must stay accurate.
        // (Browser will sessionStorage-cache on the client side.)
        'cache-control': 'no-store, max-age=0',
      },
    }
  );
}
