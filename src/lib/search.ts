import type { Organization, OrganizationCategory } from "../types";
import { CATEGORY_LIST } from "../consts";

export default async function search<T = Organization[]>(
  query: string,
  categories: OrganizationCategory[],
  faves: string | null,
  host: string = import.meta.env.MEILISEARCH_HOST,
  key: string = import.meta.env.MEILISEARCH_API_KEY
): Promise<T> {
  const url = new URL(`${host}/indexes/organization/search`);
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  let filter = (categories.length === 0 ? CATEGORY_LIST : categories)
    .map((category) => `type=${category}`)
    .join(" OR ");

  if (faves) {
    const favoriteGroups: string[] = [];
    for (let i = 0; i < faves.length; i++) {
      favoriteGroups.push(
        ...[
          ...("0" <= faves[i] && faves[i] <= "9" ? parseInt(faves[i]) : faves.charCodeAt(i) - 97 + 10)
            .toString(2)
            .padStart(5, "0"),
        ].reverse()
      );
    }

    const filteredIds: string[] = [];
    for (let i = 0; i < favoriteGroups.length; i++) {
      if (favoriteGroups[i] === "1") {
        filteredIds.push(i.toString());
      }
    }

    filter = `(${filter}) AND (id IN [${filteredIds.join(", ")}])`;
  }

  const body = `{ "q": "${query}", "filter": "${filter}", "limit": 500, "showRankingScore": true}`;
  const result = await fetch(url.toString(), { method, headers, body });
  const hits = await result.json().then((res) => res.hits);
  const filtered_hits = hits.filter((hit: { _rankingScore: number }) => hit._rankingScore > 0.65);
  if (filtered_hits.length > 0) {
    return filtered_hits as T;
  }
  return hits as T;
}
