import * as cheerio from 'cheerio';
import { getText, clean } from '../http.js';

const BASE = 'https://busy.az';
const MAX_PAGES = 3;

export function parse(html) {
  const $ = cheerio.load(html);
  const jobs = [];
  $('.job-card-title').each((_, card) => {
    const el = $(card);
    const a = el.find('h3 a[href^="/vacancy/"]').first();
    const href = a.attr('href');
    const id = href?.match(/\/vacancy\/(\d+)/)?.[1];
    const title = clean(a.text());
    if (!id || !title) return;
    const spans = el.find('.job-card-meta span');
    jobs.push({
      source: 'busy.az',
      id,
      title,
      company: clean(el.find('.job-card-meta p').first().text()),
      date: clean(spans.eq(1).text()),
      url: BASE + href,
    });
  });
  return jobs;
}

export async function fetchJobs() {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await getText(`${BASE}/category/it-software-data${page > 1 ? `?page=${page}` : ''}`);
    const jobs = parse(html);
    all.push(...jobs);
    if (!jobs.length) break;
  }
  return all;
}

export default { name: 'busy.az', fetchJobs };
