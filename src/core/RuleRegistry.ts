/**
 * RuleRegistry - Registro centralizado de IAs y sus archivos de reglas
 * 
 * Este módulo mantiene el mapeo entre herramientas de IA y sus archivos
 * de configuración esperados.
 */

import { AIRuleDefinition } from '../types';

/**
 * Definiciones de IAs soportadas
 */
export const AI_DEFINITIONS: AIRuleDefinition[] = [
    {
        id: 'cursor',
        name: 'Cursor',
        filePath: '.cursorrules',
        icon: '🎯',
        description: 'Rules for Cursor Editor (chat and Composer)'
    },
    {
        id: 'copilot',
        name: 'GitHub Copilot',
        filePath: '.github/copilot-instructions.md',
        icon: '🐙',
        description: 'Project-specific instructions for GitHub Copilot'
    },
    {
        id: 'windsurf',
        name: 'Windsurf',
        filePath: '.windsurfrules',
        icon: '🏄',
        description: 'Cascade rules for Windsurf (Codeium)'
    },
    {
        id: 'cline',
        name: 'Cline',
        filePath: '.clinerules',
        icon: '🤖',
        description: 'Rules for Cline autonomous agent'
    },
    {
        id: 'aider',
        name: 'Aider',
        filePath: '.aider.conf.yml',
        icon: '⚙️',
        description: 'Configuration for Aider CLI coding assistant'
    },
    {
        id: 'aider-conventions',
        name: 'Aider Conventions',
        filePath: 'CONVENTIONS.md',
        icon: '📋',
        description: 'Code conventions for Aider'
    },
    {
        id: 'claude',
        name: 'Claude',
        filePath: 'CLAUDE.md',
        icon: '🧠',
        description: 'Instructions for Claude AI'
    },
    {
        id: 'agents',
        name: 'Generic Agents',
        filePath: 'agents.md',
        icon: '🔮',
        description: 'Generic rules for multiple AI agents'
    }
];

/**
 * Nombre del archivo fuente de verdad
 */
export const SOURCE_FILE_NAME = 'Ai_Rules.md';

/**
 * Nombres alternativos para el archivo fuente
 */
export const SOURCE_FILE_ALTERNATIVES = [
    'Ai_Rules.md',
    'AI_Rules.md',
    'ai_rules.md',
    'AI-Rules.md'
];

/**
 * Directorios a ignorar durante el escaneo
 */
export const EXCLUDED_DIRECTORIES = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.vscode-test/**',
    '**/coverage/**',
    '**/.next/**',
    '**/target/**'
];

/**
 * RuleRegistry - Clase principal para manejo del registro de IAs
 */
export class RuleRegistry {
    private definitions: Map<string, AIRuleDefinition>;

    constructor() {
        this.definitions = new Map();

        // Inicializar el mapa con todas las definiciones
        AI_DEFINITIONS.forEach(def => {
            this.definitions.set(def.id, def);
        });
    }

    /**
     * Obtiene todas las definiciones de IAs soportadas
     */
    getAllDefinitions(): AIRuleDefinition[] {
        return Array.from(this.definitions.values());
    }

    /**
     * Obtiene una definición específica por ID
     */
    getDefinition(id: string): AIRuleDefinition | undefined {
        return this.definitions.get(id);
    }

    /**
     * Detecta el tipo de IA basado en el nombre del archivo
     * 
     * @param fileName Nombre del archivo (ej: '.cursorrules')
     * @returns ID de la IA o undefined si no se reconoce
     */
    detectAITypeByFileName(fileName: string): string | undefined {
        // Normalizar el nombre del archivo (quitar extensión de ruta)
        const normalizedName = fileName.toLowerCase();

        for (const def of this.definitions.values()) {
            const defPath = def.filePath.toLowerCase();

            // Comparación exacta del nombre completo
            if (normalizedName === defPath) {
                return def.id;
            }

            // Comparación del nombre del archivo final
            const defFileName = defPath.split('/').pop() || '';
            const inputFileName = normalizedName.split('/').pop() || '';

            if (inputFileName === defFileName) {
                return def.id;
            }
        }

        return undefined;
    }

    /**
     * Obtiene la ruta esperada para un tipo de IA
     */
    getExpectedPath(aiType: string): string | undefined {
        const def = this.definitions.get(aiType);
        return def?.filePath;
    }

    /**
     * Verifica si un tipo de IA es soportado
     */
    isSupported(aiType: string): boolean {
        return this.definitions.has(aiType);
    }

    /**
     * Obtiene el nombre amigable de una IA
     */
    getFriendlyName(aiType: string): string {
        const def = this.definitions.get(aiType);
        return def?.name || aiType;
    }

    /**
     * Obtiene el icono de una IA
     */
    getIcon(aiType: string): string {
        const def = this.definitions.get(aiType);
        return def?.icon || '📄';
    }

    /**
     * Obtiene la descripción de una IA
     */
    getDescription(aiType: string): string {
        const def = this.definitions.get(aiType);
        return def?.description || '';
    }
}

// Instancia singleton del registro
export const ruleRegistry = new RuleRegistry();
