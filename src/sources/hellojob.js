import * as cheerio from 'cheerio';
import { getText, clean } from '../http.js';

const BASE = 'https://www.hellojob.az';
const QUERIES = ['frontend', 'front-end', 'react', 'javascript', 'next.js', 'vue', 'angular', 'developer'];

export function parse(html) {
  const $ = cheerio.load(html);
  const jobs = [];
  $('a.vacancies__body').each((_, a) => {
    const el = $(a);
    const url = el.attr('href') || '';
    const id = url.split('/vakansiya/')[1];
    const title = clean(el.find('.vacancies__title').first().text());
    if (!id || !title) return;
    jobs.push({
      source: 'hellojob.az',
      id,
      title,
      company: clean(el.find('.vacancies__company-name').first().text()),
      url: url.startsWith('http') ? url : BASE + url,
    });
  });
  return jobs;
}

export async function fetchJobs() {
  const all = [];
  for (const q of QUERIES) {
    all.push(...parse(await getText(`${BASE}/vakansiyalar?q=${encodeURIComponent(q)}`)));
  }
  return all;
}

export default { name: 'hellojob.az', fetchJobs };
