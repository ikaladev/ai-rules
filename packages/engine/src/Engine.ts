import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MetadataService } from './metadata';
import {
    AI_DEFINITIONS,
    EXCLUDED_DIRECTORIES,
    SOURCE_FILE_ALTERNATIVES,
    SOURCE_FILE_NAME,
    ruleRegistry
} from './registry';
import {
    AIRuleDefinition,
    EngineOptions,
    RuleFile,
    ScanResult,
    ScanSummary,
    SyncOptions,
    SyncResult,
    SyncStatus
} from './types';

export class AiRulesEngine {
    private metadataService: MetadataService;
    private workspaceRoot: string;

    constructor(options: EngineOptions) {
        this.workspaceRoot = path.resolve(options.workspaceRoot);
        this.metadataService = new MetadataService(this.workspaceRoot);
    }

    getDefinitions(): AIRuleDefinition[] {
        return ruleRegistry.getAllDefinitions();
    }

    async scanWorkspace(): Promise<ScanResult> {
        const allFiles = await this.collectFiles(this.workspaceRoot);
        const sourceFileAbsolutePath = this.findSourceFile(allFiles);
        const sourceFile = sourceFileAbsolutePath
            ? this.toRelativePath(sourceFileAbsolutePath)
            : undefined;
        const sourceHash = sourceFileAbsolutePath
            ? await this.calculateFileHash(sourceFileAbsolutePath)
            : undefined;
        const ruleFiles: RuleFile[] = [];

        for (const definition of AI_DEFINITIONS) {
            const target = this.findRuleFile(allFiles, definition.filePath, definition.aliases);

            if (!target) {
                continue;
            }

            const targetMetadata = await this.metadataService.getTargetMetadata(definition.id);
            const syncStatus = this.determineSyncStatus(targetMetadata?.lastSyncHash, sourceHash);

            ruleFiles.push({
                path: this.toRelativePath(target),
                absolutePath: target,
                aiType: definition.id,
                syncStatus,
                lastSyncDate: targetMetadata?.lastSyncDate,
                currentHash: sourceHash
            });
        }

        return {
            sourceFile,
            sourceFileAbsolutePath,
            ruleFiles
        };
    }

    async getStatus(): Promise<ScanSummary> {
        const result = await this.scanWorkspace();
        const syncedRules = result.ruleFiles.filter(file => file.syncStatus === 'synced').length;
        const outdatedRules = result.ruleFiles.filter(file => file.syncStatus === 'outdated').length;

        return {
            hasSource: !!result.sourceFile,
            totalRules: result.ruleFiles.length,
            syncedRules,
            outdatedRules,
            absentRules: AI_DEFINITIONS.length - result.ruleFiles.length
        };
    }

    async createSourceFile(options?: { overwrite?: boolean }): Promise<string> {
        const sourcePath = path.join(this.workspaceRoot, SOURCE_FILE_NAME);

        if (await this.fileExists(sourcePath)) {
            if (!options?.overwrite) {
                throw new Error('El archivo Ai_Rules.md ya existe');
            }
        }

        await fs.writeFile(sourcePath, this.getSourceTemplate(), 'utf-8');

        const metadata = await this.metadataService.readMetadata();
        metadata.sourcePath = SOURCE_FILE_NAME;
        await this.metadataService.writeMetadata(metadata);

        return sourcePath;
    }

    async syncAll(options?: SyncOptions): Promise<SyncResult> {
        const result: SyncResult = {
            success: true,
            syncedFiles: [],
            failedFiles: []
        };

        try {
            const scanResult = await this.scanWorkspace();

            if (!scanResult.sourceFileAbsolutePath) {
                throw new Error('Ai_Rules.md not found');
            }

            const definitionsToSync = options?.aiTypes
                ? AI_DEFINITIONS.filter(definition => options.aiTypes!.includes(definition.id))
                : AI_DEFINITIONS;

            for (const definition of definitionsToSync) {
                try {
                    await this.syncDefinition(definition, scanResult.sourceFileAbsolutePath, options);
                    result.syncedFiles.push(definition.filePath);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    result.failedFiles.push(`${definition.filePath}: ${errorMsg}`);
                    result.success = false;
                }
            }

            return result;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                syncedFiles: [],
                failedFiles: [],
                error: errorMsg
            };
        }
    }

    async syncTarget(targetId: string, options?: SyncOptions): Promise<void> {
        const definition = ruleRegistry.getDefinition(targetId);

        if (!definition) {
            throw new Error(`Tipo de IA no soportado: ${targetId}`);
        }

        const scanResult = await this.scanWorkspace();

        if (!scanResult.sourceFileAbsolutePath) {
            throw new Error('Ai_Rules.md not found');
        }

        await this.syncDefinition(definition, scanResult.sourceFileAbsolutePath, options);
    }

    async consolidateRules(options?: { overwrite?: boolean }): Promise<string> {
        const sourcePath = path.join(this.workspaceRoot, SOURCE_FILE_NAME);

        if (await this.fileExists(sourcePath) && !options?.overwrite) {
            throw new Error('Ai_Rules.md ya existe');
        }

        const scanResult = await this.scanWorkspace();

        if (scanResult.ruleFiles.length === 0) {
            throw new Error('No se encontraron archivos de reglas para consolidar');
        }

        let consolidatedContent = this.getConsolidationHeader();

        for (const ruleFile of scanResult.ruleFiles) {
            const definition = ruleRegistry.getDefinition(ruleFile.aiType);
            const fileName = path.basename(ruleFile.path);

            try {
                const content = await fs.readFile(ruleFile.absolutePath, 'utf-8');
                const cleanContent = this.removeAutoGeneratedHeader(content);

                consolidatedContent += `\n## 📁 Reglas de ${definition?.name || ruleFile.aiType}\n\n`;
                consolidatedContent += `> Consolidado desde: \`${fileName}\`\n\n`;
                consolidatedContent += cleanContent + '\n\n';
                consolidatedContent += '---\n';
            } catch {
                // Continue consolidating the files that can be read.
            }
        }

        consolidatedContent += this.getConsolidationFooter(scanResult.ruleFiles.length);

        await fs.writeFile(sourcePath, consolidatedContent, 'utf-8');

        const metadata = await this.metadataService.readMetadata();
        metadata.sourcePath = SOURCE_FILE_NAME;
        await this.metadataService.writeMetadata(metadata);

        return sourcePath;
    }

    async calculateFileHash(filePath: string): Promise<string> {
        const content = await fs.readFile(filePath, 'utf-8');
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private async syncDefinition(
        definition: AIRuleDefinition,
        sourcePath: string,
        options?: SyncOptions
    ): Promise<void> {
        const targetPath = path.join(this.workspaceRoot, definition.filePath);

        if (await this.fileExists(targetPath) && !options?.overwrite) {
            throw new Error('El archivo ya existe');
        }

        const sourceContent = await fs.readFile(sourcePath, 'utf-8');
        const sourceHash = await this.calculateFileHash(sourcePath);
        const finalContent = options?.addHeader === false
            ? sourceContent
            : this.addHeader(sourceContent);

        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, finalContent, 'utf-8');
        await this.metadataService.updateTargetMetadata(definition.id, definition.filePath, sourceHash);
    }

    private findSourceFile(files: string[]): string | undefined {
        const alternatives = new Set(SOURCE_FILE_ALTERNATIVES.map(file => file.toLowerCase()));
        const candidates = files.filter(file => alternatives.has(path.basename(file).toLowerCase()));

        return this.selectShallowestFile(candidates);
    }

    private findRuleFile(files: string[], filePath: string, aliases?: string[]): string | undefined {
        const candidates = [filePath, ...(aliases || [])].map(candidate => this.normalizeRelative(candidate));
        const matchedFiles = files.filter(file => {
            const relativePath = this.normalizeRelative(this.toRelativePath(file));
            return candidates.includes(relativePath);
        });

        return this.selectShallowestFile(matchedFiles);
    }

    private selectShallowestFile(files: string[]): string | undefined {
        return [...files].sort((a, b) => {
            const depthA = this.toRelativePath(a).split(path.sep).length;
            const depthB = this.toRelativePath(b).split(path.sep).length;
            return depthA - depthB;
        })[0];
    }

    private determineSyncStatus(lastSyncHash?: string, sourceHash?: string): SyncStatus {
        if (!sourceHash) {
            return 'unknown';
        }

        if (!lastSyncHash) {
            return 'outdated';
        }

        return lastSyncHash === sourceHash ? 'synced' : 'outdated';
    }

    private async collectFiles(directory: string): Promise<string[]> {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        const files: string[] = [];

        for (const entry of entries) {
            if (entry.isDirectory() && EXCLUDED_DIRECTORIES.includes(entry.name)) {
                continue;
            }

            const entryPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                files.push(...await this.collectFiles(entryPath));
            } else if (entry.isFile()) {
                files.push(entryPath);
            }
        }

        return files;
    }

    private toRelativePath(filePath: string): string {
        return path.relative(this.workspaceRoot, filePath);
    }

    private normalizeRelative(filePath: string): string {
        return filePath.replace(/\\/g, '/').toLowerCase();
    }

    private addHeader(content: string): string {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

        return `# ⚠️ Archivo generado automáticamente
# Fuente: Ai_Rules.md
# Fecha: ${timestamp}
# No editar directamente - los cambios se sobrescribirán
# 
# Para actualizar estas reglas, edita Ai_Rules.md y ejecuta:
# "AI Rules: Sincronizar todas las reglas"

---

${content}`;
    }

    private removeAutoGeneratedHeader(content: string): string {
        const headerPattern = /^#\s*⚠️\s*Archivo generado automáticamente[\s\S]*?---\s*\n\n/;
        return content.replace(headerPattern, '').trim();
    }

    private getConsolidationHeader(): string {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

        return `# 🤖 Reglas de IA - Consolidadas

Este archivo fue generado automáticamente consolidando reglas dispersas encontradas en el proyecto.

**Fecha de consolidación**: ${timestamp}

---

## 💡 Qué hacer ahora

1. **Revisa** el contenido consolidado abajo
2. **Edita** y organiza las reglas como prefieras
3. **Sincroniza** para propagar cambios: ejecuta "AI Rules: Sincronizar todas las reglas"
4. **(Opcional)** Elimina los archivos originales si ya no los necesitas

---

`;
    }

    private getConsolidationFooter(filesCount: number): string {
        return `\n\n---

## ✨ Consolidación Completada

Se consolidaron **${filesCount} archivos** de reglas en este documento.

**Próximos pasos sugeridos**:
- Organiza y limpia reglas duplicadas
- Agrega reglas específicas para tu proyecto
- Ejecuta "AI Rules: Sincronizar todas las reglas" para aplicar cambios

---

*Este es ahora tu archivo fuente de verdad para todas las herramientas de IA*
`;
    }

    private getSourceTemplate(): string {
        return `# 🤖 AI Rules - Source of Truth

This file is the **single source of truth** for all AI rules in this project.

Changes here are automatically synchronized to:
- Cursor (.cursorrules)
- GitHub Copilot (.github/copilot-instructions.md)
- Windsurf (.windsurfrules)
- Cline (.clinerules)
- Aider (.aider.conf.yml)
- Claude (CLAUDE.md)
- Generic agents (agents.md / AGENTS.md)

## 📋 General Rules

### Code Style
- Use TypeScript for all new code
- Follow camelCase naming conventions
- Document public functions with JSDoc
- Keep functions small and focused

### Architecture
- Separation of concerns
- Reusable components
- Dependency injection where appropriate

### Testing
- Write unit tests for business logic
- Maintain coverage > 80%

### Documentation
- Keep README updated
- Comments in English
- Document important decisions

## 🎯 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **IDE**: Visual Studio Code
- **Version control**: Git

## 💡 AI Preferences

- Explain the reasoning behind suggestions
- Prioritize clean and maintainable code over premature optimization
- Suggest best practices and design patterns when relevant
- Detect and warn about potential bugs or security issues

---

✨ **Tip**: Sync these changes by running "AI Rules: Sync All Rules" from the command palette.
`;
    }
}

export function createEngine(options: EngineOptions): AiRulesEngine {
    return new AiRulesEngine(options);
}
