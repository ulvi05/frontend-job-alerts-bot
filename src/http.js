const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

export async function get(url, { headers = {}, timeoutMs = 20000 } = {}) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, 'accept-language': 'az,en;q=0.8,ru;q=0.6', ...headers },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res;
}

export const getText = async (url, opts) => (await get(url, opts)).text();
export const getJson = async (url, opts) => (await get(url, opts)).json();

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
