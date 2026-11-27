import { getJson, clean } from "../http.js";

const API = "https://api.glorri.az/job-service-v2/jobs/public";
const KEYWORDS = [
  "frontend",
  "front-end",
  "react",
  "javascript",
  "vue",
  "angular",
  "developer",
];
const LIMIT = 20;
const MAX_PAGES = 3;

export function parse(data) {
  return (data?.entities ?? []).map((it) => ({
    source: "glorri.az",
    id: it.slug,
    title: clean(it.title),
    company: clean(it.company?.name),
    date: (it.postedDate || "").slice(0, 10),
    url: `https://jobs.glorri.az/vacancies/${it.company?.slug}/${it.slug}`,
  }));
}

export async function fetchJobs() {
  const all = [];
  for (const kw of KEYWORDS) {
    for (let page = 0; page < MAX_PAGES; page++) {
      const qs = new URLSearchParams({
        offset: page * LIMIT,
        limit: LIMIT,
        keyword: kw,
      });
      const data = await getJson(`${API}?${qs}`);
      all.push(...parse(data));
      if ((page + 1) * LIMIT >= (data.totalCount ?? 0)) break;
    }
  }
  return all;
}

export default { name: "glorri.az", fetchJobs };
