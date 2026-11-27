import { sleep } from './http.js';

const esc = (s) => (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function formatJob(job) {
  const lines = [`💼 <b>${esc(job.title)}</b>`];
  if (job.company) lines.push(`🏢 ${esc(job.company)}`);
  if (job.salary) lines.push(`💰 ${esc(job.salary)}`);
  if (job.date) lines.push(`📅 ${esc(job.date)}`);
  lines.push(`🌐 ${esc(job.source)}`);
  lines.push(`<a href="${esc(job.url)}">Elana bax →</a>`);
  return lines.join('\n');
}

export async function send(text, { token, chatId }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (res.ok) return;
    const body = await res.json().catch(() => ({}));
    if (res.status === 429) {
      await sleep(((body.parameters?.retry_after ?? 5) + 1) * 1000);
      continue;
    }
    throw new Error(`Telegram xətası ${res.status}: ${body.description ?? ''}`);
  }
  throw new Error('Telegram: çox sayda 429 cavabı');
}
