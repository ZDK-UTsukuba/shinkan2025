import { defineConfig, passthroughImageService } from "astro/config";
import arraybuffer from "vite-plugin-arraybuffer";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import search from "./src/lib/search";
import { CATEGORY_LIST } from "./src/consts";
const siteUrl = process.env.CF_PAGES_URL ?? "https://shinkan-web.zdk.tsukuba.ac.jp";

const count: Record<string, number> = {};

for (const category of CATEGORY_LIST) {
  const org = await search("", [category], null, process.env.MEILISEARCH_HOST, process.env.MEILISEARCH_API_KEY);
  count[category] = org.length;
}

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: "hybrid",
  integrations: [
    icon({
      include: {
        mdi: ["web"],
        ri: ["search-line", "question-line", "heart-3-line", "heart-3-fill", "twitter-x-fill", "instagram-line"],
        jam: ["line"],
        "material-symbols": ["mail-outline"],
      },
    }),
  ],
  image: {
    service: passthroughImageService(),
  },
  adapter: cloudflare(),
  vite: {
    plugins: [arraybuffer()],
    define: {
      "process.env.STRAPI_URL": JSON.stringify(process.env.STRAPI_URL),
      "process.env.MEILISEARCH_HOST": JSON.stringify(process.env.MEILISEARCH_HOST),
      "process.env.MEILISEARCH_API_KEY": JSON.stringify(process.env.MEILISEARCH_API_KEY),
      "process.env.CATEGORY_COUNTS": JSON.stringify(count),
    },
  },
});
