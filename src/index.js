import { readFile, writeFile } from 'node:fs/promises';
import { makeMatcher, crossKey } from './filter.js';
import { formatJob, send } from './telegram.js';
import { sleep } from './http.js';

import bossaz from './sources/bossaz.js';
import hellojob from './sources/hellojob.js';
import jobsearch from './sources/jobsearch.js';
import smartjob from './sources/smartjob.js';
import busy from './sources/busy.js';
import cyberjob from './sources/cyberjob.js';

const SOURCES = [jobsearch, bossaz, hellojob, smartjob, busy, cyberjob];
const STATE_FILE = new URL('../seen.json', import.meta.url);
const CONFIG_FILE = new URL('../config.json', import.meta.url);
const DRY = process.argv.includes('--dry');
const ERROR_ALERT_STREAK = 3; // sayt ardıcıl 3 dəfə xəta versə Telegram-a xəbərdarlıq

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const config = await loadJson(CONFIG_FILE, {});
  const state = await loadJson(STATE_FILE, { seen: {}, errors: {} });
  state.seen ??= {};
  state.errors ??= {};
  const firstRun = Object.keys(state.seen).length === 0;

  const tg = { token: process.env.TELEGRAM_BOT_TOKEN, chatId: process.env.TELEGRAM_CHAT_ID };
  if (!DRY && (!tg.token || !tg.chatId)) {
    throw new Error('TELEGRAM_BOT_TOKEN və TELEGRAM_CHAT_ID mühit dəyişənləri lazımdır (və ya --dry ilə işlət)');
  }
  const notify = (text) => (DRY ? console.log('\n[TELEGRAM]\n' + text) : send(text, tg));

  const matches = makeMatcher(config);
  const now = Date.now();
  const fresh = [];
  const runKeys = new Set();

  const results = await Promise.allSettled(SOURCES.map((s) => s.fetchJobs()));

  for (const [i, r] of results.entries()) {
    const name = SOURCES[i].name;
    if (r.status === 'rejected') {
      state.errors[name] = (state.errors[name] ?? 0) + 1;
      console.error(`✗ ${name}: ${r.reason?.message ?? r.reason}`);
      if (state.errors[name] === ERROR_ALERT_STREAK) {
        await notify(`⚠️ <b>${name}</b> ardıcıl ${ERROR_ALERT_STREAK} dəfədir oxunmur. Saytın strukturu dəyişmiş ola bilər.`);
      }
      continue;
    }
    state.errors[name] = 0;
    const jobs = r.value.filter(matches);
    console.log(`✓ ${name}: ${r.value.length} elan oxundu, ${jobs.length} uyğun`);

    for (const job of jobs) {
      const key = `${job.source}:${job.id}`;
      // Şirkət adı yoxdursa, saytlararası təkrar yoxlamasını etmə (fərqli elanlar qarışmasın)
      const xkey = job.company ? `x:${crossKey(job)}` : null;
      if (runKeys.has(key) || (xkey && runKeys.has(xkey))) continue;
      runKeys.add(key);
      const isNew = !state.seen[key] && !(xkey && state.seen[xkey]);
      state.seen[key] ??= now;
      if (xkey) {
        runKeys.add(xkey);
        state.seen[xkey] ??= now;
      }
      if (isNew) fresh.push(job);
    }
  }

  console.log(`\nYeni elan sayı: ${fresh.length}${firstRun ? ' (ilk işə salınma)' : ''}`);

  if (firstRun && fresh.length) {
    await notify(`🤖 Bot işə düşdü! Hazırda aktiv olan ${fresh.length} uyğun elan tapıldı:`);
  }
  for (const job of fresh) {
    await notify(formatJob(job));
    if (!DRY) await sleep(1100); // Telegram limitlərinə düşməmək üçün
  }

  // Köhnə qeydləri təmizlə ki, seen.json şişməsin
  const maxAge = (config.seenRetentionDays ?? 60) * 86400000;
  for (const [k, t] of Object.entries(state.seen)) if (now - t > maxAge) delete state.seen[k];

  if (!DRY) await writeFile(STATE_FILE, JSON.stringify(state, null, 1) + '\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
