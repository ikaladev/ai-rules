import { AIRuleDefinition } from './types';

export const SOURCE_FILE_NAME = 'Ai_Rules.md';

export const SOURCE_FILE_ALTERNATIVES = [
    'Ai_Rules.md',
    'AI_Rules.md',
    'ai_rules.md',
    'AI-Rules.md'
];

export const EXCLUDED_DIRECTORIES = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    '.vscode-test',
    'coverage',
    '.next',
    'target'
];

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
        aliases: ['AGENTS.md'],
        icon: '🔮',
        description: 'Generic rules for multiple agents'
    }
];

export class RuleRegistry {
    private definitions = new Map<string, AIRuleDefinition>();

    constructor(definitions: AIRuleDefinition[] = AI_DEFINITIONS) {
        definitions.forEach(definition => {
            this.definitions.set(definition.id, definition);
        });
    }

    getAllDefinitions(): AIRuleDefinition[] {
        return Array.from(this.definitions.values());
    }

    getDefinition(id: string): AIRuleDefinition | undefined {
        return this.definitions.get(id);
    }

    detectAITypeByFileName(fileName: string): string | undefined {
        const normalizedName = normalizePath(fileName);

        for (const definition of this.definitions.values()) {
            const candidates = [definition.filePath, ...(definition.aliases || [])];

            for (const candidate of candidates) {
                const normalizedCandidate = normalizePath(candidate);

                if (normalizedName === normalizedCandidate) {
                    return definition.id;
                }

                const candidateFileName = normalizedCandidate.split('/').pop() || '';
                const inputFileName = normalizedName.split('/').pop() || '';

                if (inputFileName === candidateFileName) {
                    return definition.id;
                }
            }
        }

        return undefined;
    }

    getExpectedPath(aiType: string): string | undefined {
        return this.definitions.get(aiType)?.filePath;
    }

    isSupported(aiType: string): boolean {
        return this.definitions.has(aiType);
    }

    getFriendlyName(aiType: string): string {
        return this.definitions.get(aiType)?.name || aiType;
    }

    getIcon(aiType: string): string {
        return this.definitions.get(aiType)?.icon || '📄';
    }

    getDescription(aiType: string): string {
        return this.definitions.get(aiType)?.description || '';
    }
}

function normalizePath(value: string): string {
    return value.replace(/\\/g, '/').toLowerCase();
}

export const ruleRegistry = new RuleRegistry();
