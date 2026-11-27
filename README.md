# Job Alert Bot 🤖

Scrapes **Frontend / React** vacancies from Azerbaijani job sites — boss.az, hellojob.az, jobsearch.az, smartjob.az, busy.az, cyberjob.az and jobs.glorri.com — and sends new ones to Telegram. Runs for free on GitHub Actions every 2 hours.

## Features

- **7 sources** — JSON APIs where available (jobsearch.az, smartjob.az), HTML parsing with Cheerio elsewhere
- **Keyword filtering** — configurable include/exclude lists, normalized for Azerbaijani characters (`ə`, `ı`, `ş`…)
- **Deduplication** — each vacancy is sent only once, even if the same job is posted on several sites
- **State in the repo** — seen vacancies are stored in `seen.json` and committed back by the workflow
- **Failure alerts** — if a site fails 3 runs in a row (e.g. its layout changed), you get a Telegram warning
- **Zero infrastructure** — no server, no database; just GitHub Actions

## Setup (~10 minutes)

### 1. Create a Telegram bot
1. Message **@BotFather** on Telegram → `/newbot` → pick a name → you get a **bot token** (`123456:ABC...`).
2. Send any message to your new bot (e.g. `hi`).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and find `"chat":{"id":123456789` — that number is your **chat ID**.
   Alternatively, message **@userinfobot** and it will reply with your ID.

### 2. Configure the GitHub repository
1. Push this project to a GitHub repository (private is fine).
2. Go to **Settings → Secrets and variables → Actions → New repository secret** and add:
   - `TELEGRAM_BOT_TOKEN` — the token from BotFather
   - `TELEGRAM_CHAT_ID` — your chat ID
3. Open the **Actions** tab → **İş elanları botu** → **Run workflow** to trigger the first run manually.

The first run sends all currently active matching vacancies; after that, only new ones.

## Running locally

```bash
npm install
npm run dry    # fetch and filter, print to console — sends nothing
npm test       # parser tests
```

To send real messages locally, create a `.env` file (and make sure it's in `.gitignore`):

```
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
```

```bash
node --env-file=.env src/index.js
```

## Configuration — `config.json`

| Key | Description |
| --- | --- |
| `includeKeywords` | A vacancy is sent if its title contains any of these |
| `excludeKeywords` | A vacancy is skipped if its title contains any of these — e.g. `["senior", "lead", "principal"]` for junior roles only |
| `seenRetentionDays` | How long seen vacancies are remembered (default: 60) |

The schedule is the `cron` line in `.github/workflows/is-elanlari.yml`.

## Project structure

```
src/
  index.js          # main flow: fetch → filter → dedupe → notify → save state
  filter.js         # keyword matching and normalization
  telegram.js       # message formatting and sending (with 429 retry)
  http.js           # fetch helpers
  sources/          # one adapter per job site
test/
  parsers.test.js   # parser tests on real HTML/JSON samples
seen.json           # created by the bot; stores already-sent vacancies
```

## Adding a new site

Create a file in `src/sources/` that exports `{ name, fetchJobs }`, where `fetchJobs()` returns an array of:

```js
{ source, id, title, company, url, salary?, date? }
```

Then add it to the `SOURCES` array in `src/index.js`.

## Notes

- If a site changes its layout, its parser will break. The bot warns you on Telegram after 3 consecutive failures.
- Some sites may block GitHub's server IPs. If so, you'll see lines like `✗ boss.az: HTTP 403` in the Actions logs.
- The bot commits `seen.json` on every run that finds something new. This also keeps the repository active, so GitHub doesn't disable the scheduled workflow after 60 days of inactivity.