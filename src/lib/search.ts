import * as Sentry from "@sentry/astro";
import type { Organization, OrganizationCategory, MeiliSearchResponse, OrganizationSearchResult } from "../types";
import { CATEGORY_LIST } from "../consts";

export default async function search<T = Organization[]>(
  query: string,
  categories: OrganizationCategory[],
  faves: string | null,
  host: string = import.meta.env.MEILISEARCH_HOST,
  key: string = import.meta.env.MEILISEARCH_API_KEY
): Promise<T> {
  console.log("[DEBUG] search function called with params:", {
    query,
    categories: categories?.length ? categories : "undefined/empty",
    faves: faves ? `${faves.length} chars` : null,
    host: host ? `${host.substring(0, 10)}...` : "undefined",
    hasKey: !!key,
  });

  // 安全対策：categoriesが存在しない場合は空配列を使用
  if (!categories) {
    console.error("[DEBUG] categories is undefined!");
    categories = [];
  }

  const url = new URL(`${host}/indexes/organization/search`);
  const method = "POST";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  // カテゴリリストの作成
  const categoryList = categories.length === 0 ? CATEGORY_LIST : categories;
  console.log("[DEBUG] Using categories:", categoryList);

  try {
    // フィルターの構築
    let filter = categoryList.map((category) => `type=${category}`).join(" OR ");

    console.log("[DEBUG] Initial filter:", filter);

    // お気に入りフィルターの追加
    if (faves) {
      console.log("[DEBUG] Processing favorites string of length:", faves.length);
      const favoriteGroups: string[] = [];
      for (let i = 0; i < faves.length; i++) {
        const charCode = "0" <= faves[i] && faves[i] <= "9" ? parseInt(faves[i]) : faves.charCodeAt(i) - 97 + 10;

        console.log(`[DEBUG] Processing char '${faves[i]}' at index ${i}, code: ${charCode}`);

        const binary = charCode.toString(2).padStart(5, "0");
        console.log(`[DEBUG] Binary representation: ${binary}`);

        favoriteGroups.push(...[...binary].reverse());
      }

      console.log("[DEBUG] Favorite groups array length:", favoriteGroups.length);

      const filteredIds: string[] = [];
      for (let i = 0; i < favoriteGroups.length; i++) {
        if (favoriteGroups[i] === "1") {
          filteredIds.push(i.toString());
        }
      }

      console.log("[DEBUG] Filtered IDs:", filteredIds);

      filter = `(${filter}) AND (id IN [${filteredIds.join(", ")}])`;
      console.log("[DEBUG] Final filter with favorites:", filter);
    }

    // APIリクエストの作成と送信
    const body = `{ "q": "${query}", "filter": "${filter}", "limit": 500, "showRankingScore": true}`;
    console.log("[DEBUG] Request URL:", url.toString());
    console.log("[DEBUG] Request body:", body);

    const result = await fetch(url.toString(), { method, headers, body });
    console.log("[DEBUG] Response status:", result.status);

    if (!result.ok) {
      console.error("[DEBUG] API request failed with status:", result.status);
      const errorText = await result.text();
      console.error("[DEBUG] Error response:", errorText);
      const error = new Error(`API request failed with status ${result.status}: ${errorText}`);
      Sentry.captureException(error); // Sentryにエラーを送信
      throw error;
    }

    // MeiliSearchResponse<OrganizationSearchResult> 型を適用
    const json = (await result.json()) as MeiliSearchResponse<OrganizationSearchResult>;

    // json が null または hits プロパティが存在しないか確認
    if (!json || !json.hits) {
      console.error("[DEBUG] Invalid API response:", JSON.stringify(json).substring(0, 200) + "...");
      const error = new Error("Invalid API response: hits property missing or invalid");
      Sentry.captureException(error); // Sentryにエラーを送信
      throw error;
    }

    const hits = json.hits;
    console.log("[DEBUG] Number of hits before filtering:", hits.length);

    // スコアによるフィルタリング
    const filtered_hits: OrganizationSearchResult[] = hits.filter((hit: OrganizationSearchResult) => {
      // _rankingScore が存在し、かつ number 型であることを確認
      if (typeof hit._rankingScore !== "number") {
        console.log(
          "[DEBUG] Hit missing or invalid ranking score:",
          hit ? JSON.stringify(hit).substring(0, 100) : "null"
        );
        return false; // スコアがない場合は除外
      }

      // ここから下では hit._rankingScore は number 型であることが保証される
      const score = hit._rankingScore;
      const isScoreHigh = score > 0.65;

      if (!isScoreHigh) {
        console.log("[DEBUG] Hit with low score:", {
          id: hit.id,
          score: score, // score は number 型
        });
      }

      return isScoreHigh;
    });

    console.log("[DEBUG] Number of hits after filtering:", filtered_hits.length);

    // 結果の返却
    if (filtered_hits.length > 0) {
      // T は Organization[] だが、ここでは OrganizationSearchResult[] を返す
      // 必要に応じて呼び出し元で変換する
      return filtered_hits as unknown as T;
    }
    // T は Organization[] だが、ここでは OrganizationSearchResult[] を返す
    // 必要に応じて呼び出し元で変換する
    return hits as unknown as T;
  } catch (error) {
    console.error("[DEBUG] Error in search function:", error);
    Sentry.captureException(error); // Sentryにエラーを送信
    throw error;
  }
}
