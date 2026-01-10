/**
 * Templates Index - Exporta todas las categorías de plantillas
 */

import { TemplateCategory } from './types';
import { generalTemplates } from './general';
import { frontendTemplates } from './frontend';
import { backendTemplates } from './backend';
import { testingTemplates } from './testing';

export * from './types';

/**
 * Todas las categorías de plantillas disponibles
 */
export const templateCategories: TemplateCategory[] = [
    {
        id: 'general',
        icon: '📋',
        names: { es: 'General', en: 'General' },
        descriptions: {
            es: 'Reglas generales para cualquier proyecto',
            en: 'General rules for any project'
        },
        templates: generalTemplates
    },
    {
        id: 'frontend',
        icon: '🎨',
        names: { es: 'Frontend', en: 'Frontend' },
        descriptions: {
            es: 'React, Vue, Angular, CSS, etc.',
            en: 'React, Vue, Angular, CSS, etc.'
        },
        templates: frontendTemplates
    },
    {
        id: 'backend',
        icon: '⚙️',
        names: { es: 'Backend', en: 'Backend' },
        descriptions: {
            es: 'APIs, Bases de datos, Autenticación',
            en: 'APIs, Databases, Auth'
        },
        templates: backendTemplates
    },
    {
        id: 'testing',
        icon: '🧪',
        names: { es: 'Testing', en: 'Testing' },
        descriptions: {
            es: 'Unit tests, Integration, E2E',
            en: 'Unit tests, Integration, E2E'
        },
        templates: testingTemplates
    }
];

/**
 * Obtiene una categoría por ID
 */
export function getCategoryById(id: string): TemplateCategory | undefined {
    return templateCategories.find(cat => cat.id === id);
}

/**
 * Obtiene una plantilla específica por categoría e ID
 */
export function getTemplateById(categoryId: string, templateId: string) {
    const category = getCategoryById(categoryId);
    return category?.templates.find(t => t.id === templateId);
}
