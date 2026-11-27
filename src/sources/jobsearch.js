import { getJson, clean } from "../http.js";

const BASE = "https://jobsearch.az";
const QUERIES = [
  "frontend",
  "front-end",
  "react",
  "javascript",
  "vue",
  "angular",
  "next.js",
];

export function parse(data) {
  return (data?.items ?? []).map((it) => ({
    source: "jobsearch.az",
    id: String(it.id),
    title: clean(it.title),
    company: it.hide_company ? "" : clean(it.company?.title),
    salary: clean(it.salary),
    date: (it.created_at || "").slice(0, 10),
    url: `${BASE}/vacancies/${it.slug}`,
  }));
}

export async function fetchJobs() {
  const all = [];
  for (const q of QUERIES) {
    const data = await getJson(
      `${BASE}/api-az/vacancies-az?hl=az&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "x-requested-with": "XMLHttpRequest",
          accept: "application/json",
        },
      },
    );
    all.push(...parse(data));
  }
  return all;
}

export default { name: "jobsearch.az", fetchJobs };
