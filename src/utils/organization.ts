import type { Organization, OrganizationCategory } from "../types/index.ts";
import { CONTACTS_INFO_ICON, DISPLAY_CONTACTS_INFO } from "../consts.ts";

export function lookupOrganizationCategoryName(orgType: OrganizationCategory) {
  switch (orgType) {
    case "athletic_department":
      return "体育系";
    case "artistic_union":
      return "芸術系";
    case "cultural_federation":
      return "文化系";
    case "general":
      return "一般学生団体";
    case "others":
      return "その他";
    default:
      return "不明";
  }
}

export function enumerateContactInfomations(org: Organization) {
  const ret: {
    name: string;
    value: string;
    displayName: string;
    link: string;
    icon: string;
  }[] = [];
  const attr = org.attributes;
  for (const [key, val] of Object.entries(attr)) {
    if (key.startsWith("contacts_") && val) {
      const name = key.slice(9);
      const value = val.trim();
      ret.push({
        name,
        value,
        displayName: DISPLAY_CONTACTS_INFO[name] || name,
        link: contactInfomationLink(name, value),
        icon: CONTACTS_INFO_ICON[name] || "",
      });
    }
  }
  return ret;
}

function contactInfomationLink(name: string, value: string) {
  return (
    {
      website: !value.startsWith("http://") && !value.startsWith("https://") ? `http://${value}` : value,
      x: `https://twitter.com/${value.replace(/^@*/i, "")}`,
      instagram: `https://instagram.com/${value.replace(/^@*/i, "")}`,
      line: value,
      email: `mailto:${value}`,
    }[name] || "#"
  );
}
