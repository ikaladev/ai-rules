export type Language = 'es' | 'en';

export interface LocalizedContent {
    name: string;
    description: string;
    content: string;
}

export interface RuleTemplate {
    id: string;
    es: LocalizedContent;
    en: LocalizedContent;
}

export interface TemplateCategory {
    id: string;
    icon: string;
    names: { es: string; en: string };
    descriptions: { es: string; en: string };
    templates: RuleTemplate[];
}
