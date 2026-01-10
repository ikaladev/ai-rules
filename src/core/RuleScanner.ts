/**
 * RuleScanner - Búsqueda y detección de archivos de reglas
 * 
 * Este módulo escanea el workspace para encontrar archivos de reglas de IA
 * y clasificarlos según el tipo de herramienta.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import { ScanResult, RuleFile, SyncStatus } from '../types';
import {
    ruleRegistry,
    SOURCE_FILE_ALTERNATIVES,
    EXCLUDED_DIRECTORIES,
    AI_DEFINITIONS
} from './RuleRegistry';
import { MetadataService } from '../utils/metadata';

/**
 * Servicio de escaneo de archivos de reglas
 */
export class RuleScanner {
    private metadataService: MetadataService;

    constructor(metadataService: MetadataService) {
        this.metadataService = metadataService;
    }

    /**
     * Escanea el workspace completo en busca de archivos de reglas
     */
    async scanWorkspace(): Promise<ScanResult> {
        const sourceFile = await this.findSourceFile();
        const ruleFiles = await this.findRuleFiles(sourceFile);

        return {
            sourceFile,
            ruleFiles
        };
    }

    /**
     * Busca el archivo fuente (Ai_Rules.md)
     */
    private async findSourceFile(): Promise<vscode.Uri | undefined> {
        // Buscar todas las variantes del nombre del archivo fuente
        for (const fileName of SOURCE_FILE_ALTERNATIVES) {
            const pattern = new vscode.RelativePattern(
                vscode.workspace.workspaceFolders![0],
                `**/${fileName}`
            );

            const files = await vscode.workspace.findFiles(
                pattern,
                `{${EXCLUDED_DIRECTORIES.join(',')}}`
            );

            if (files.length > 0) {
                // Retornar el primero encontrado (preferiblemente en la raíz)
                return this.selectBestSourceFile(files);
            }
        }

        return undefined;
    }

    /**
     * Selecciona el mejor archivo fuente si hay múltiples
     * Prioriza archivos en la raíz del workspace
     */
    private selectBestSourceFile(files: vscode.Uri[]): vscode.Uri {
        if (files.length === 1) {
            return files[0];
        }

        const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;

        // Ordenar por profundidad (menos profundo = más cerca de la raíz)
        const sorted = files.sort((a, b) => {
            const depthA = path.relative(workspaceRoot, a.fsPath).split(path.sep).length;
            const depthB = path.relative(workspaceRoot, b.fsPath).split(path.sep).length;
            return depthA - depthB;
        });

        return sorted[0];
    }

    /**
     * Busca todos los archivos de reglas de IAs
     */
    private async findRuleFiles(sourceFile?: vscode.Uri): Promise<RuleFile[]> {
        const ruleFiles: RuleFile[] = [];
        const sourceHash = sourceFile ? await this.calculateFileHash(sourceFile) : undefined;

        // Buscar cada tipo de archivo de reglas definido
        for (const definition of AI_DEFINITIONS) {
            const file = await this.findRuleFile(definition.filePath);

            if (file) {
                const syncStatus = await this.determineSyncStatus(
                    definition.id,
                    file,
                    sourceHash
                );

                const targetMetadata = await this.metadataService.getTargetMetadata(definition.id);

                ruleFiles.push({
                    uri: file,
                    aiType: definition.id,
                    syncStatus,
                    lastSyncDate: targetMetadata?.lastSyncDate
                        ? new Date(targetMetadata.lastSyncDate)
                        : undefined,
                    currentHash: sourceHash
                });
            }
        }

        return ruleFiles;
    }

    /**
     * Busca un archivo de reglas específico
     */
    private async findRuleFile(filePath: string): Promise<vscode.Uri | undefined> {
        const pattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders![0],
            filePath
        );

        const files = await vscode.workspace.findFiles(
            pattern,
            `{${EXCLUDED_DIRECTORIES.join(',')}}`
        );

        return files.length > 0 ? files[0] : undefined;
    }

    /**
     * Determina el estado de sincronización de un archivo
     */
    private async determineSyncStatus(
        aiType: string,
        fileUri: vscode.Uri,
        sourceHash?: string
    ): Promise<SyncStatus> {
        // Si no hay archivo fuente, no podemos determinar el estado
        if (!sourceHash) {
            return 'unknown';
        }

        const targetMetadata = await this.metadataService.getTargetMetadata(aiType);

        // Si no hay metadata de sincronización previa, está desactualizado
        if (!targetMetadata) {
            return 'outdated';
        }

        // Comparar el hash del archivo fuente con el hash guardado
        const isSynced = targetMetadata.lastSyncHash === sourceHash;

        return isSynced ? 'synced' : 'outdated';
    }

    /**
     * Calcula el hash SHA-256 de un archivo
     */
    async calculateFileHash(fileUri: vscode.Uri): Promise<string> {
        try {
            const content = await fs.readFile(fileUri.fsPath, 'utf-8');
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            throw new Error(`Error al calcular hash del archivo: ${errorMsg}`);
        }
    }

    /**
     * Verifica si un archivo existe
     */
    async fileExists(fileUri: vscode.Uri): Promise<boolean> {
        try {
            await fs.access(fileUri.fsPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Busca archivos de reglas por patrón personalizado
     */
    async findFilesByPattern(pattern: string): Promise<vscode.Uri[]> {
        const relativePattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders![0],
            pattern
        );

        return await vscode.workspace.findFiles(
            relativePattern,
            `{${EXCLUDED_DIRECTORIES.join(',')}}`
        );
    }

    /**
     * Obtiene información resumida del escaneo
     */
    async getScanSummary(): Promise<{
        hasSource: boolean;
        totalRules: number;
        syncedRules: number;
        outdatedRules: number;
        absentRules: number;
    }> {
        const result = await this.scanWorkspace();

        const syncedRules = result.ruleFiles.filter(f => f.syncStatus === 'synced').length;
        const outdatedRules = result.ruleFiles.filter(f => f.syncStatus === 'outdated').length;
        const totalDefinitions = AI_DEFINITIONS.length;

        return {
            hasSource: !!result.sourceFile,
            totalRules: result.ruleFiles.length,
            syncedRules,
            outdatedRules,
            absentRules: totalDefinitions - result.ruleFiles.length
        };
    }
}

/**
 * Crea una instancia del escáner para el workspace actual
 */
export function createRuleScanner(metadataService: MetadataService): RuleScanner {
    return new RuleScanner(metadataService);
}
