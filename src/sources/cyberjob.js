import * as cheerio from 'cheerio';
import { getText, clean } from '../http.js';

const BASE = 'https://cyberjob.az';
// 2 = Proqramlaşdırma, 13 = Təcrübə (internship)
const PAGES = ['/vacancies?CategoryId=2', '/vacancies?CategoryId=13', '/vacancies?search=frontend'];

export function parse(html) {
  const $ = cheerio.load(html);
  const jobs = [];
  $('a[href]').each((_, a) => {
    const el = $(a);
    const href = el.attr('href');
    const id = href.match(/^(?:https:\/\/cyberjob\.az)?\/vacancies\/(\d+)$/)?.[1];
    const title = clean(el.find('h3').first().text());
    if (!id || !title) return;
    jobs.push({
      source: 'cyberjob.az',
      id,
      title,
      company: clean(el.find('h3').next('p').find('span').first().text()),
      url: `${BASE}/vacancies/${id}`,
    });
  });
  return jobs;
}

export async function fetchJobs() {
  const all = [];
  for (const p of PAGES) all.push(...parse(await getText(BASE + p)));
  return all;
}

export default { name: 'cyberjob.az', fetchJobs };
