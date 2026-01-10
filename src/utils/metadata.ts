/**
 * Metadata - Manejo de .vscode/ai-rules.json
 * 
 * Este módulo gestiona la lectura y escritura de metadata de sincronización
 * en el archivo .vscode/ai-rules.json
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Metadata, TargetMetadata } from '../types';

/**
 * Nombre del archivo de metadata
 */
const METADATA_FILE_NAME = 'ai-rules.json';

/**
 * Ruta del directorio de metadata
 */
const METADATA_DIR = '.vscode';

/**
 * Servicio para manejo de metadata
 */
export class MetadataService {
    private workspaceRoot: string;
    private metadataPath: string;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.metadataPath = path.join(workspaceRoot, METADATA_DIR, METADATA_FILE_NAME);
    }

    /**
     * Lee la metadata del archivo
     * Si no existe, retorna metadata vacía
     */
    async readMetadata(): Promise<Metadata> {
        try {
            const content = await fs.readFile(this.metadataPath, 'utf-8');
            const parsed = JSON.parse(content);

            // Validar estructura básica
            if (!parsed.sourcePath || !parsed.targets) {
                return this.getDefaultMetadata();
            }

            return parsed as Metadata;
        } catch (error) {
            // Si el archivo no existe o hay error de lectura, retornar metadata por defecto
            return this.getDefaultMetadata();
        }
    }

    /**
     * Escribe la metadata al archivo
     * Crea el directorio .vscode si no existe
     */
    async writeMetadata(metadata: Metadata): Promise<void> {
        try {
            // Asegurar que existe el directorio .vscode
            const vscodeDirPath = path.join(this.workspaceRoot, METADATA_DIR);
            await fs.mkdir(vscodeDirPath, { recursive: true });

            // Escribir el archivo con formato bonito
            const content = JSON.stringify(metadata, null, 2);
            await fs.writeFile(this.metadataPath, content, 'utf-8');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            throw new Error(`Error al escribir metadata: ${errorMsg}`);
        }
    }

    /**
     * Actualiza la información de sincronización para un tipo de IA específico
     */
    async updateTargetMetadata(
        aiType: string,
        targetPath: string,
        hash: string
    ): Promise<void> {
        const metadata = await this.readMetadata();

        // Actualizar o crear entrada para este tipo de IA
        metadata.targets[aiType] = {
            path: targetPath,
            lastSyncHash: hash,
            lastSyncDate: new Date().toISOString()
        };

        await this.writeMetadata(metadata);
    }

    /**
     * Obtiene la metadata de un target específico
     */
    async getTargetMetadata(aiType: string): Promise<TargetMetadata | undefined> {
        const metadata = await this.readMetadata();
        return metadata.targets[aiType];
    }

    /**
     * Verifica si un archivo está sincronizado comparando hashes
     */
    async isFileSynced(aiType: string, currentHash: string): Promise<boolean> {
        const targetMetadata = await this.getTargetMetadata(aiType);

        if (!targetMetadata) {
            return false;
        }

        return targetMetadata.lastSyncHash === currentHash;
    }

    /**
     * Elimina la metadata de un target específico
     */
    async removeTargetMetadata(aiType: string): Promise<void> {
        const metadata = await this.readMetadata();

        if (metadata.targets[aiType]) {
            delete metadata.targets[aiType];
            await this.writeMetadata(metadata);
        }
    }

    /**
     * Limpia toda la metadata
     */
    async clearMetadata(): Promise<void> {
        await this.writeMetadata(this.getDefaultMetadata());
    }

    /**
     * Verifica si existe el archivo de metadata
     */
    async metadataExists(): Promise<boolean> {
        try {
            await fs.access(this.metadataPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Metadata por defecto
     */
    private getDefaultMetadata(): Metadata {
        return {
            sourcePath: 'Ai_Rules.md',
            targets: {}
        };
    }
}

/**
 * Crea una instancia del servicio de metadata para el workspace actual
 */
export function createMetadataService(): MetadataService | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return undefined;
    }

    return new MetadataService(workspaceFolder.uri.fsPath);
}
