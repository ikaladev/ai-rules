import * as vscode from 'vscode';
import { MetadataService } from '../../packages/engine/src';

export { Metadata, MetadataService, TargetMetadata } from '../../packages/engine/src';

export function createMetadataService(): MetadataService | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return undefined;
    }

    return new MetadataService(workspaceFolder.uri.fsPath);
}
