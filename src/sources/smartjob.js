import { getJson, clean } from "../http.js";

const BASE = "https://smartjob.az";
const CATEGORY = "IT & Development (Proqramlaşdırma)";
const MAX_PAGES = 3;

export function parse(data) {
  return (data?.jobs ?? []).map((it) => ({
    source: "smartjob.az",
    id: String(it.id),
    title: clean(it.title),
    company: clean(it.company),
    salary: clean(it.salary),
    date: clean(it.postedAt),
    url: `${BASE}/vakansiyalar/${it.slug}`,
  }));
}

export async function fetchJobs() {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const qs = new URLSearchParams({ page, limit: 20, mainCategory: CATEGORY });
    const data = await getJson(`${BASE}/api/jobs?${qs}`);
    all.push(...parse(data));
    if (page >= (data.pageCount ?? 1)) break;
  }
  return all;
}

export default { name: "smartjob.az", fetchJobs };
