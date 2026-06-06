import * as fs from 'fs/promises';
import * as path from 'path';
import { Metadata, TargetMetadata } from './types';

const METADATA_FILE_NAME = 'ai-rules.json';
const METADATA_DIR = '.vscode';

export class MetadataService {
    private metadataPath: string;

    constructor(private workspaceRoot: string) {
        this.metadataPath = path.join(workspaceRoot, METADATA_DIR, METADATA_FILE_NAME);
    }

    async readMetadata(): Promise<Metadata> {
        try {
            const content = await fs.readFile(this.metadataPath, 'utf-8');
            const parsed = JSON.parse(content);

            if (!parsed.sourcePath || !parsed.targets) {
                return this.getDefaultMetadata();
            }

            return parsed as Metadata;
        } catch {
            return this.getDefaultMetadata();
        }
    }

    async writeMetadata(metadata: Metadata): Promise<void> {
        const vscodeDirPath = path.join(this.workspaceRoot, METADATA_DIR);
        await fs.mkdir(vscodeDirPath, { recursive: true });
        await fs.writeFile(this.metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    async updateTargetMetadata(aiType: string, targetPath: string, hash: string): Promise<void> {
        const metadata = await this.readMetadata();

        metadata.targets[aiType] = {
            path: targetPath,
            lastSyncHash: hash,
            lastSyncDate: new Date().toISOString()
        };

        await this.writeMetadata(metadata);
    }

    async getTargetMetadata(aiType: string): Promise<TargetMetadata | undefined> {
        const metadata = await this.readMetadata();
        return metadata.targets[aiType];
    }

    async isFileSynced(aiType: string, currentHash: string): Promise<boolean> {
        const targetMetadata = await this.getTargetMetadata(aiType);
        return targetMetadata?.lastSyncHash === currentHash;
    }

    async removeTargetMetadata(aiType: string): Promise<void> {
        const metadata = await this.readMetadata();

        if (metadata.targets[aiType]) {
            delete metadata.targets[aiType];
            await this.writeMetadata(metadata);
        }
    }

    async clearMetadata(): Promise<void> {
        await this.writeMetadata(this.getDefaultMetadata());
    }

    async metadataExists(): Promise<boolean> {
        try {
            await fs.access(this.metadataPath);
            return true;
        } catch {
            return false;
        }
    }

    private getDefaultMetadata(): Metadata {
        return {
            sourcePath: 'Ai_Rules.md',
            targets: {}
        };
    }
}
