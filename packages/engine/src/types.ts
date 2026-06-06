export interface AIRuleDefinition {
    id: string;
    name: string;
    filePath: string;
    aliases?: string[];
    icon: string;
    description: string;
}

export type SyncStatus = 'synced' | 'outdated' | 'absent' | 'unknown';

export interface RuleFile {
    path: string;
    absolutePath: string;
    aiType: string;
    syncStatus: SyncStatus;
    lastSyncDate?: string;
    currentHash?: string;
}

export interface ScanResult {
    sourceFile?: string;
    sourceFileAbsolutePath?: string;
    ruleFiles: RuleFile[];
}

export interface TargetMetadata {
    path: string;
    lastSyncHash: string;
    lastSyncDate: string;
}

export interface Metadata {
    sourcePath: string;
    targets: {
        [aiType: string]: TargetMetadata;
    };
}

export interface SyncOptions {
    overwrite?: boolean;
    addHeader?: boolean;
    aiTypes?: string[];
}

export interface SyncResult {
    success: boolean;
    syncedFiles: string[];
    failedFiles: string[];
    error?: string;
}

export interface EngineOptions {
    workspaceRoot: string;
}

export interface ScanSummary {
    hasSource: boolean;
    totalRules: number;
    syncedRules: number;
    outdatedRules: number;
    absentRules: number;
}
