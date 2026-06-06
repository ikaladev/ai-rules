/**
 * RuleScanner - Adaptador VS Code sobre el motor portable.
 */

import * as vscode from 'vscode';
import { createEngine } from '../../packages/engine/src';
import { ScanResult, RuleFile } from '../types';
import { MetadataService } from '../utils/metadata';

export class RuleScanner {
    private engine = createEngine({ workspaceRoot: this.workspaceRoot });

    constructor(
        private metadataService: MetadataService,
        private workspaceRoot: string = vscode.workspace.workspaceFolders![0].uri.fsPath
    ) {
        void this.metadataService;
    }

    async scanWorkspace(): Promise<ScanResult> {
        const result = await this.engine.scanWorkspace();

        return {
            sourceFile: result.sourceFileAbsolutePath
                ? vscode.Uri.file(result.sourceFileAbsolutePath)
                : undefined,
            ruleFiles: result.ruleFiles.map(file => this.toVSCodeRuleFile(file))
        };
    }

    async calculateFileHash(fileUri: vscode.Uri): Promise<string> {
        return this.engine.calculateFileHash(fileUri.fsPath);
    }

    async fileExists(fileUri: vscode.Uri): Promise<boolean> {
        return this.engine.fileExists(fileUri.fsPath);
    }

    async findFilesByPattern(pattern: string): Promise<vscode.Uri[]> {
        const relativePattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders![0],
            pattern
        );

        return vscode.workspace.findFiles(relativePattern);
    }

    async getScanSummary(): Promise<{
        hasSource: boolean;
        totalRules: number;
        syncedRules: number;
        outdatedRules: number;
        absentRules: number;
    }> {
        return this.engine.getStatus();
    }

    private toVSCodeRuleFile(file: import('../../packages/engine/src').RuleFile): RuleFile {
        return {
            uri: vscode.Uri.file(file.absolutePath),
            aiType: file.aiType,
            syncStatus: file.syncStatus,
            lastSyncDate: file.lastSyncDate ? new Date(file.lastSyncDate) : undefined,
            currentHash: file.currentHash
        };
    }
}

export function createRuleScanner(metadataService: MetadataService): RuleScanner {
    return new RuleScanner(metadataService);
}
