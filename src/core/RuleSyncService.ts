/**
 * RuleSyncService - Adaptador VS Code sobre la sincronización del motor portable.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { createEngine, ruleRegistry } from '../../packages/engine/src';
import { SyncOptions, SyncResult } from '../types';
import { MetadataService } from '../utils/metadata';
import { RuleScanner } from './RuleScanner';

export class RuleSyncService {
    private engine = createEngine({ workspaceRoot: this.workspaceRoot });

    constructor(
        private metadataService: MetadataService,
        private scanner: RuleScanner,
        private workspaceRoot: string = vscode.workspace.workspaceFolders![0].uri.fsPath
    ) {
        void this.metadataService;
        void this.scanner;
    }

    async syncAll(sourceUri: vscode.Uri, options?: SyncOptions): Promise<SyncResult> {
        void sourceUri;

        if (options?.askConfirmation !== false) {
            const confirmedTargets = await this.confirmExistingTargets(options?.aiTypes);

            return this.engine.syncAll({
                addHeader: options?.addHeader,
                aiTypes: confirmedTargets,
                overwrite: true
            });
        }

        return this.engine.syncAll({
            addHeader: options?.addHeader,
            aiTypes: options?.aiTypes,
            overwrite: true
        });
    }

    async syncSingle(
        aiType: string,
        targetPath: string,
        content: string,
        sourceHash: string,
        options?: SyncOptions
    ): Promise<void> {
        void targetPath;
        void content;
        void sourceHash;

        await this.syncByAIType(aiType, vscode.Uri.file(path.join(this.workspaceRoot, 'Ai_Rules.md')), options);
    }

    async syncByAIType(
        aiType: string,
        sourceUri: vscode.Uri,
        options?: SyncOptions
    ): Promise<void> {
        void sourceUri;

        const definition = ruleRegistry.getDefinition(aiType);

        if (!definition) {
            throw new Error(`Tipo de IA no soportado: ${aiType}`);
        }

        if (options?.askConfirmation !== false) {
            const shouldContinue = await this.confirmOverwrite(definition.filePath);

            if (!shouldContinue) {
                throw new Error('Sincronización cancelada por el usuario');
            }
        }

        await this.engine.syncTarget(aiType, {
            addHeader: options?.addHeader,
            overwrite: true
        });
    }

    async createSourceFile(): Promise<vscode.Uri> {
        const sourcePath = await this.engine.createSourceFile();
        return vscode.Uri.file(sourcePath);
    }

    async consolidateRules(): Promise<vscode.Uri> {
        const sourcePath = path.join(this.workspaceRoot, 'Ai_Rules.md');

        if (await this.engine.fileExists(sourcePath)) {
            const overwrite = await vscode.window.showWarningMessage(
                'Ai_Rules.md ya existe. ¿Deseas sobrescribirlo con las reglas consolidadas?',
                { modal: true },
                'Sí, sobrescribir',
                'No, cancelar'
            );

            if (overwrite !== 'Sí, sobrescribir') {
                throw new Error('Consolidación cancelada por el usuario');
            }
        }

        return vscode.Uri.file(await this.engine.consolidateRules({ overwrite: true }));
    }

    private async confirmExistingTargets(aiTypes?: string[]): Promise<string[]> {
        const definitions = ruleRegistry.getAllDefinitions()
            .filter(definition => !aiTypes || aiTypes.includes(definition.id));
        const confirmedTargets: string[] = [];

        for (const definition of definitions) {
            if (await this.engine.fileExists(path.join(this.workspaceRoot, definition.filePath))) {
                const confirmed = await this.confirmOverwrite(definition.filePath);

                if (!confirmed) {
                    continue;
                }
            }

            confirmedTargets.push(definition.id);
        }

        return confirmedTargets;
    }

    private async confirmOverwrite(filePath: string): Promise<boolean> {
        const fullPath = path.join(this.workspaceRoot, filePath);

        if (!await this.engine.fileExists(fullPath)) {
            return true;
        }

        const answer = await vscode.window.showWarningMessage(
            `El archivo ${filePath} ya existe. ¿Deseas sobrescribirlo?`,
            { modal: true },
            'Sí',
            'No'
        );

        return answer === 'Sí';
    }
}

export function createRuleSyncService(
    metadataService: MetadataService,
    scanner: RuleScanner
): RuleSyncService {
    return new RuleSyncService(metadataService, scanner);
}
