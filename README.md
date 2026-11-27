# İş elanları botu 🤖

boss.az, hellojob.az, jobsearch.az, smartjob.az, busy.az və cyberjob.az saytlarından **Frontend / React** elanlarını yığır, yeniləri Telegram-a göndərir. GitHub Actions üzərində hər 2 saatdan bir pulsuz işləyir.

## Quraşdırma (təxminən 10 dəqiqə)

### 1. Telegram bot yarat
1. Telegram-da **@BotFather**-ə yaz → `/newbot` → ad ver → sənə **token** verəcək (`123456:ABC...`).
2. Yeni botuna istənilən mesaj yaz (məs. `salam`).
3. Brauzerdə aç: `https://api.telegram.org/bot<TOKEN>/getUpdates` → cavabda `"chat":{"id": 123456789` — bu sənin **chat ID**-ndir.

### 2. GitHub repo
1. GitHub-da yeni repo yarat (private ola bilər) və bu qovluğu push et:
   ```bash
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<user>/is-elanlari-bot.git
   git push -u origin main
   ```
2. Repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `TELEGRAM_BOT_TOKEN` = BotFather-in verdiyi token
   - `TELEGRAM_CHAT_ID` = chat ID
3. Repo → **Actions** tab → "İş elanları botu" → **Run workflow** ilə ilk dəfə əl ilə işə sal.

İlk işə salınmada hazırda aktiv olan bütün uyğun elanlar gələcək, sonra yalnız **yenilər**.

## Lokal test
```bash
npm install
npm run dry     # Telegram-a göndərmir, nəticəni konsola yazır
npm test        # parser testləri
```

## Tənzimləmə — `config.json`
- `includeKeywords` — elan başlığında bunlardan biri olsa, göndərilir
- `excludeKeywords` — bunlar olsa, göndərilmir. Məsələn yalnız junior elanlar istəyirsənsə: `["senior", "lead", "principal"]`
- `seenRetentionDays` — görülmüş elanlar neçə gün yadda saxlanılsın

Tezlik `.github/workflows/is-elanlari.yml` faylındakı `cron` sətirindədir.

## Yeni sayt əlavə etmək
`src/sources/` içində yeni fayl yarat: `{ name, fetchJobs() }` export etsin, `fetchJobs` isə `{ source, id, title, company, url }` massivi qaytarsın. Sonra `src/index.js`-dəki `SOURCES` siyahısına əlavə et.

## Qeydlər
- Saytlar dizaynını dəyişsə, həmin saytın parseri sınar. Sayt ardıcıl 3 dəfə oxunmasa, bot Telegram-a xəbərdarlıq göndərir.
- Bəzi saytlar GitHub serverlərinin IP-lərini bloklaya bilər. Belə olsa, Actions loglarında `✗ sayt: HTTP 403` görəcəksən.
- `seen.json` faylını bot özü commit edir. Bu həm də GitHub-ın 60 gün aktivliksiz repolarda cron-u dayandırmasının qarşısını alır.
