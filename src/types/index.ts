/**
 * Tipos y definiciones de TypeScript para AI Rules Manager
 */

import * as vscode from 'vscode';

/**
 * Definición de una regla de IA soportada
 */
export interface AIRuleDefinition {
    /** ID único de la IA (ej: 'cursor', 'copilot') */
    id: string;

    /** Nombre amigable para mostrar (ej: 'Cursor', 'GitHub Copilot') */
    name: string;

    /** Ruta del archivo esperado (ej: '.cursorrules', '.github/copilot-instructions.md') */
    filePath: string;

    /** Emoji para mostrar en TreeView */
    icon: string;

    /** Descripción breve de la IA */
    description: string;
}

/**
 * Estado de sincronización de un archivo de reglas
 */
export type SyncStatus = 'synced' | 'outdated' | 'absent' | 'unknown';

/**
 * Archivo de reglas detectado en el proyecto
 */
export interface RuleFile {
    /** URI del archivo */
    uri: vscode.Uri;

    /** Tipo de IA (cursor, copilot, etc.) */
    aiType: string;

    /** Estado de sincronización */
    syncStatus: SyncStatus;

    /** Fecha de última sincronización */
    lastSyncDate?: Date;

    /** Hash actual del archivo fuente cuando se sincronizó */
    currentHash?: string;
}

/**
 * Resultado del escaneo del proyecto
 */
export interface ScanResult {
    /** Archivo fuente (Ai_Rules.md) */
    sourceFile?: vscode.Uri;

    /** Archivos de reglas encontrados */
    ruleFiles: RuleFile[];
}

/**
 * Metadata de sincronización para una IA específica
 */
export interface TargetMetadata {
    /** Ruta del archivo de destino */
    path: string;

    /** Hash SHA-256 del contenido fuente en última sincronización */
    lastSyncHash: string;

    /** Fecha ISO de última sincronización */
    lastSyncDate: string;
}

/**
 * Metadata completa guardada en .vscode/ai-rules.json
 */
export interface Metadata {
    /** Ruta del archivo fuente */
    sourcePath: string;

    /** Información de sincronización por tipo de IA */
    targets: {
        [aiType: string]: TargetMetadata;
    };
}

/**
 * Opciones para sincronización
 */
export interface SyncOptions {
    /** Si debe solicitar confirmación antes de sobrescribir */
    askConfirmation?: boolean;

    /** Si debe agregar encabezado automático */
    addHeader?: boolean;

    /** IAs específicas a sincronizar (si está vacío, sincroniza todas) */
    aiTypes?: string[];
}

/**
 * Resultado de una operación de sincronización
 */
export interface SyncResult {
    /** Si la operación fue exitosa */
    success: boolean;

    /** Archivos sincronizados exitosamente */
    syncedFiles: string[];

    /** Archivos que fallaron */
    failedFiles: string[];

    /** Mensaje de error si hubo */
    error?: string;
}
