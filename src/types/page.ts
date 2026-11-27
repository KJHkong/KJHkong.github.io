import type { ProjectResource } from './resource';

export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
    order?: string[];
    group_by_status?: boolean;
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
    pdf?: { path: string; available?: boolean };
    notice?: { title: string; content?: string };
}

export interface CardItem {
    id?: string;
    title: string;
    subtitle?: string;
    date?: string;
    content?: string;
    compact_content?: string;
    content_variants?: string[];
    ongoing?: boolean;
    resources?: ProjectResource[];
    highlight?: boolean;
    tags?: string[];
    link?: string;
    image?: string;
    entries?: Array<{ title: string; date: string }>;
    projects?: CardItem[];
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    compact_projects?: boolean;
    items: CardItem[];
}
