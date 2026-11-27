// Azərbaycan hərflərini sadələşdir ki, "Frontend" / "FRONTEND" / "Front-end" eyni tutulsun
export function normalize(s) {
  return (s ?? '')
    .toLocaleLowerCase('az')
    .replace(/[ı]/g, 'i')
    .replace(/[ə]/g, 'e')
    .replace(/[ö]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[ğ]/g, 'g')
    .replace(/[ş]/g, 's')
    .replace(/[ç]/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

export function makeMatcher({ includeKeywords = [], excludeKeywords = [] }) {
  const inc = includeKeywords.map(normalize);
  const exc = excludeKeywords.map(normalize);
  return (job) => {
    const t = normalize(job.title);
    return inc.some((k) => t.includes(k)) && !exc.some((k) => t.includes(k));
  };
}

// Eyni elan bir neçə saytda ola bilər (məs. həm jobsearch, həm cyberjob)
export function crossKey(job) {
  return `${normalize(job.title)}|${normalize(job.company)}`.replace(/[^a-z0-9|]/g, '');
}
