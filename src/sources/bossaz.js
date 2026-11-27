import * as cheerio from 'cheerio';
import { getText, clean } from '../http.js';

const BASE = 'https://boss.az';
// 69 = Proqramlaşdırma, 72 = Proqram təminatı mühəndisi, 159 = Veb-dizayn
const PAGES = [
  '/search/vacancies?categoryIds=69',
  '/search/vacancies?categoryIds=72',
  '/search/vacancies?categoryIds=159',
  '/search/vacancies',
];

export function parse(html) {
  const $ = cheerio.load(html);
  const jobs = [];
  $('a[href^="/vacancies/"]').each((_, a) => {
    const el = $(a);
    const href = el.attr('href');
    const id = href.match(/\/vacancies\/(\d+)/)?.[1];
    const title = clean(el.find('[data-cy="ad-card-subtitle"]').text());
    if (!id || !title) return;
    jobs.push({
      source: 'boss.az',
      id,
      title,
      company: clean(el.find('[data-cy="ad-card-title"]').text()),
      salary: clean(el.find('[data-cy="ad-card-salary"]').text()),
      date: clean(el.find('[data-cy="ad-card-date"]').text()),
      url: BASE + href,
    });
  });
  return jobs;
}

export async function fetchJobs() {
  const all = [];
  for (const p of PAGES) all.push(...parse(await getText(BASE + p)));
  return all;
}

export default { name: 'boss.az', fetchJobs };
