import type { OpenGraphImage } from "./types";

export const SITE_NAME = "筑波大学 新歓Web 2025";
export const DEFAULT_SITE_DESCRIPTION = "2025年度筑波大学新歓Web";
export const DEFAULT_OG_IMAGE: OpenGraphImage = {
  src: "og-image.png",
  alt: "筑波大学 新歓Web 2025",
};

export const CATEGORY_LIST = [
  "athletic_department",
  "artistic_union",
  "cultural_federation",
  "general",
  "others",
] as const;

export const DISPLAY_CONTACTS_INFO: { [name: string]: string } = {
  website: "Webサイト",
  x: "X (Twitter)",
  instagram: "Instagram",
  line: "LINE",
  email: "E-mail",
};

export const CONTACTS_INFO_ICON: { [name: string]: string } = {
  website: "mdi:web",
  x: "ri:twitter-x-fill",
  instagram: "ri:instagram-line",
  line: "jam:line",
  email: "material-symbols:mail-outline",
};
