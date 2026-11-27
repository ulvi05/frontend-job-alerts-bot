// Real saytlardan götürülmüş HTML/JSON nümunələri üzərində parser testləri
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as boss from '../src/sources/bossaz.js';
import * as hello from '../src/sources/hellojob.js';
import * as js from '../src/sources/jobsearch.js';
import * as smart from '../src/sources/smartjob.js';
import * as busy from '../src/sources/busy.js';
import * as cyber from '../src/sources/cyberjob.js';
import { makeMatcher, normalize } from '../src/filter.js';
import config from '../config.json' with { type: 'json' };

test('boss.az', () => {
  const html = `<a href="/vacancies/276171"><div data-cy="ad-card"><div><div><p data-cy="ad-card-title">OZİO MMC</p></div></div>
  <div><p data-cy="ad-card-subtitle">C#/.NET Software Engineer</p><div data-cy="ad-card-salary">800 - 1600 ₼</div></div>
  <div><span data-cy="ad-card-location">Bakı</span><span data-cy="ad-card-date">Bu gün, 14:07</span></div></div></a>
  <a href="/vacancies/1">boş link</a>`;
  const [j, ...rest] = boss.parse(html);
  assert.equal(rest.length, 0);
  assert.deepEqual(j, {
    source: 'boss.az', id: '276171', title: 'C#/.NET Software Engineer', company: 'OZİO MMC',
    salary: '800 - 1600 ₼', date: 'Bu gün, 14:07', url: 'https://boss.az/vacancies/276171',
  });
});

test('hellojob.az', () => {
  const html = `<a href="https://www.hellojob.az/vakansiya/full-stack-developer-17917877" class="vacancies__body vacancies__body--card h-100">
  <div class="vacancies__content"><div class="vacancies__head"><h2 class="vacancies__title vacancies__title--card">Full-stack Developer</h2></div>
  <div class="vacancies__company-row"><div class="vacancies__company"><span class="vacancies__company-name">Maverick</span></div></div></div></a>`;
  const [j] = hello.parse(html);
  assert.equal(j.id, 'full-stack-developer-17917877');
  assert.equal(j.title, 'Full-stack Developer');
  assert.equal(j.company, 'Maverick');
});

test('jobsearch.az', () => {
  const [j] = js.parse({ items: [{ id: 157043, title: 'Junior Frontend Developer', created_at: '2026-11-26T00:00:00+04:00',
    slug: 'pasha-insurance-junior-frontend-developer-157043', company: { title: 'PASHA Insurance' }, salary: '', hide_company: false }] });
  assert.equal(j.url, 'https://jobsearch.az/vacancies/pasha-insurance-junior-frontend-developer-157043');
  assert.equal(j.date, '2026-11-26');
  assert.equal(j.company, 'PASHA Insurance');
});

test('smartjob.az', () => {
  const [j] = smart.parse({ jobs: [{ id: '171331', slug: 'kiber-mwxfpu7m', title: 'Backend Engineer', company: 'Azericard', salary: 'Razılaşma yolu ilə', postedAt: '26.11.2026' }] });
  assert.equal(j.url, 'https://smartjob.az/vakansiyalar/kiber-mwxfpu7m');
  assert.equal(j.company, 'Azericard');
});

test('busy.az', () => {
  const html = `<div class="job-card-title"><h3><a href="/vacancy/208671/system-engineer">System Engineer</a></h3><div class="job-card-meta"><p>SOCAR Tech</p><span><i></i> <!-- -->Bakı</span><span><i></i> <!-- -->3 saat əvvəl</span></div></div>`;
  const [j] = busy.parse(html);
  assert.deepEqual(j, { source: 'busy.az', id: '208671', title: 'System Engineer', company: 'SOCAR Tech', date: '3 saat əvvəl', url: 'https://busy.az/vacancy/208671/system-engineer' });
});

test('cyberjob.az', () => {
  const html = `<a href="/vacancies/341" class="block"><div><div><h3 class="font-bold">Mühəndis-proqramlaşdırıcı (backend developer)</h3>
  <p class="text-gray-400"><span class="truncate">ADY Express</span><span>Bakı</span></p></div></div></a>
  <a href="/vacancies">Daha çox</a><a href="/vacancies/310">Premium <span>x</span></a>`;
  const jobs = cyber.parse(html);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].company, 'ADY Express');
  assert.equal(jobs[0].url, 'https://cyberjob.az/vacancies/341');
});

test('filter', () => {
  const m = makeMatcher(config);
  const yes = ['Junior Frontend Developer', 'Front-End Developer (React)', 'FRONTEND', 'Next.js developer', 'Senior Full-Stack Developer', 'Veb proqramçı'];
  const no = ['System Engineer', 'Backend Proqramçı', 'Satış təmsilçisi', 'Java Developer', 'İT Help Desk'];
  for (const t of yes) assert.ok(m({ title: t }), t);
  for (const t of no) assert.ok(!m({ title: t }), t);
  assert.equal(normalize('Veb Proqramçı'), 'veb proqramci');
});
