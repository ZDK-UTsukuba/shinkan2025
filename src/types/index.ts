import { CATEGORY_LIST } from "../consts";

export interface OpenGraphImage {
  src: string;
  alt: string;
}

export interface HeaderLink {
  href: string;
  text: string;
  icon: string;
}

export type OrganizationCategory = (typeof CATEGORY_LIST)[number];

export interface ImageAttribute {
  width: number;
  height: number;
  url: string;
}

interface Image {
  id: number;
  attributes: {
    width: number;
    height: number;
    url: string;
    formats: {
      thumbnail: ImageAttribute;
      small?: ImageAttribute;
      medium?: ImageAttribute;
      large?: ImageAttribute;
    };
  };
}

export interface SingleImage {
  data: Image;
}

export interface MultipleImages {
  data: Image[];
}

interface Tag {
  id: number;
  display_string: string;
}

export interface Organization {
  id: number;
  attributes: {
    name: string;
    type: OrganizationCategory;
    type_display: any;
    short_description: string;
    description: string;
    activity_date: string;
    booth_location: string;
    activity_location: string;
    suspended: boolean;
    contacts_x?: string;
    contacts_instagram?: string;
    contacts_website?: string;
    contacts_line?: string;
    contacts_email?: string;
    organization_platform_id: number;
    thumbnail: SingleImage;
    images: MultipleImages;
    tags: Tag[];
  };
}

export interface ImageSearchResult {
  id: number;
  width: number;
  height: number;
  url: string;
  formats: {
    thumbnail: ImageAttribute;
    small?: ImageAttribute;
    medium?: ImageAttribute;
    large?: ImageAttribute;
  };
}

export interface OrganizationSearchResult {
  id: number;
  name: string;
  type: OrganizationCategory;
  type_display: any;
  short_description: string;
  description: string;
  activity_date: string;
  booth_location: string;
  activity_location: string;
  suspended: boolean;
  contacts_x?: string;
  contacts_instagram?: string;
  contacts_website?: string;
  contacts_line?: string;
  contacts_email?: string;
  organization_platform_id: number;
  thumbnail: ImageSearchResult;
  images: ImageSearchResult[];
  tags: Tag[];
  _rankingScore?: number;
}
export interface MeiliSearchResponse<T> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}
