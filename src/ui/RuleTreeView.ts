/**
 * RuleTreeView - Vista de árbol para visualización de reglas
 * 
 * Este módulo proporciona la interfaz visual en el sidebar de VS Code
 * para mostrar el estado de las reglas de IA.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ScanResult, RuleFile, SyncStatus } from '../types';
import { ruleRegistry } from '../core/RuleRegistry';

/**
 * Tipos de nodos en el árbol
 */
enum TreeItemType {
    Source = 'source',
    AIRule = 'ai-rule',
    NoSource = 'no-source',
    Empty = 'empty'
}

/**
 * Item personalizado del TreeView
 */
class RuleTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly type: TreeItemType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly fileUri?: vscode.Uri,
        public readonly aiType?: string,
        public readonly syncStatus?: SyncStatus
    ) {
        super(label, collapsibleState);

        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIcon();
        this.contextValue = type;

        // Hacer clicable para abrir archivos
        if (fileUri) {
            this.command = {
                command: 'aiRules.openFile',
                title: 'Abrir archivo',
                arguments: [fileUri]
            };
        }
    }

    private getTooltip(): string {
        switch (this.type) {
            case TreeItemType.Source:
                return 'Archivo fuente de reglas (Ai_Rules.md)';

            case TreeItemType.AIRule:
                if (!this.aiType) return '';
                const definition = ruleRegistry.getDefinition(this.aiType);
                const statusText = this.getStatusText();
                return `${definition?.description || ''}\n\nEstado: ${statusText}`;

            case TreeItemType.NoSource:
                return 'El archivo fuente Ai_Rules.md no existe. Créalo para comenzar.';

            default:
                return '';
        }
    }

    private getDescription(): string {
        if (this.type === TreeItemType.AIRule && this.fileUri) {
            return path.basename(this.fileUri.fsPath);
        }
        return '';
    }

    private getIcon(): vscode.ThemeIcon {
        switch (this.type) {
            case TreeItemType.Source:
                return new vscode.ThemeIcon('file-text', new vscode.ThemeColor('charts.blue'));

            case TreeItemType.AIRule:
                return this.getStatusIcon();

            case TreeItemType.NoSource:
                return new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));

            default:
                return new vscode.ThemeIcon('file');
        }
    }

    private getStatusIcon(): vscode.ThemeIcon {
        switch (this.syncStatus) {
            case 'synced':
                return new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'));

            case 'outdated':
                return new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));

            case 'absent':
                return new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));

            default:
                return new vscode.ThemeIcon('question', new vscode.ThemeColor('foreground'));
        }
    }

    private getStatusText(): string {
        switch (this.syncStatus) {
            case 'synced':
                return '✅ Sincronizado';
            case 'outdated':
                return '⚠️ Desactualizado';
            case 'absent':
                return '❌ Ausente';
            default:
                return '❓ Desconocido';
        }
    }
}

/**
 * Provider del TreeView
 */
export class RuleTreeProvider implements vscode.TreeDataProvider<RuleTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<RuleTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private scanResult: ScanResult | undefined;

    /**
     * Actualiza los datos del árbol
     */
    updateScanResult(result: ScanResult): void {
        this.scanResult = result;
        this.refresh();
    }

    /**
     * Refresca la vista del árbol
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Limpia la vista
     */
    clear(): void {
        this.scanResult = undefined;
        this.refresh();
    }

    /**
     * Obtiene el elemento del árbol
     */
    getTreeItem(element: RuleTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Obtiene los hijos de un elemento
     */
    async getChildren(element?: RuleTreeItem): Promise<RuleTreeItem[]> {
        // Nodo raíz
        if (!element) {
            return this.getRootNodes();
        }

        // Los nodos no tienen hijos en este caso
        return [];
    }

    /**
     * Obtiene los nodos raíz del árbol
     */
    private getRootNodes(): RuleTreeItem[] {
        if (!this.scanResult) {
            return [];
        }

        const nodes: RuleTreeItem[] = [];

        // Nodo del archivo fuente
        if (this.scanResult.sourceFile) {
            nodes.push(new RuleTreeItem(
                '📄 Ai_Rules.md (Fuente)',
                TreeItemType.Source,
                vscode.TreeItemCollapsibleState.None,
                this.scanResult.sourceFile
            ));
        } else {
            nodes.push(new RuleTreeItem(
                '⚠️ Ai_Rules.md no encontrado',
                TreeItemType.NoSource,
                vscode.TreeItemCollapsibleState.None
            ));
        }

        // Nodos de archivos de reglas existentes
        for (const ruleFile of this.scanResult.ruleFiles) {
            nodes.push(this.createRuleNode(ruleFile));
        }

        // Nodos de IAs ausentes
        const absentAIs = this.getAbsentAIs(this.scanResult.ruleFiles);
        for (const aiType of absentAIs) {
            nodes.push(this.createAbsentNode(aiType));
        }

        return nodes;
    }

    /**
     * Crea un nodo para un archivo de reglas
     */
    private createRuleNode(ruleFile: RuleFile): RuleTreeItem {
        const definition = ruleRegistry.getDefinition(ruleFile.aiType);
        const icon = definition?.icon || '📄';
        const name = definition?.name || ruleFile.aiType;

        let label = `${icon} ${name}`;

        // Agregar indicador de estado
        switch (ruleFile.syncStatus) {
            case 'synced':
                label = `✅ ${icon} ${name}`;
                break;
            case 'outdated':
                label = `⚠️ ${icon} ${name}`;
                break;
        }

        return new RuleTreeItem(
            label,
            TreeItemType.AIRule,
            vscode.TreeItemCollapsibleState.None,
            ruleFile.uri,
            ruleFile.aiType,
            ruleFile.syncStatus
        );
    }

    /**
     * Crea un nodo para una IA ausente
     */
    private createAbsentNode(aiType: string): RuleTreeItem {
        const definition = ruleRegistry.getDefinition(aiType);
        const icon = definition?.icon || '📄';
        const name = definition?.name || aiType;

        return new RuleTreeItem(
            `❌ ${icon} ${name}`,
            TreeItemType.AIRule,
            vscode.TreeItemCollapsibleState.None,
            undefined,
            aiType,
            'absent'
        );
    }

    /**
     * Obtiene las IAs que no tienen archivos
     */
    private getAbsentAIs(existingFiles: RuleFile[]): string[] {
        const existingTypes = new Set(existingFiles.map(f => f.aiType));
        const allDefinitions = ruleRegistry.getAllDefinitions();

        return allDefinitions
            .map(def => def.id)
            .filter(id => !existingTypes.has(id));
    }
}

/**
 * Crea y registra el TreeView
 */
export function createRuleTreeView(context: vscode.ExtensionContext): {
    provider: RuleTreeProvider;
    view: vscode.TreeView<RuleTreeItem>;
} {
    const provider = new RuleTreeProvider();

    const view = vscode.window.createTreeView('aiRulesManager', {
        treeDataProvider: provider,
        showCollapseAll: false
    });

    context.subscriptions.push(view);

    return { provider, view };
}
