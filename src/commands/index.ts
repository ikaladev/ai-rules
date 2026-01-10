/**
 * Commands - Comandos registrados de la extensión
 * 
 * Este módulo define y registra todos los comandos disponibles
 * para los usuarios de la extensión.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { RuleScanner } from '../core/RuleScanner';
import { RuleSyncService } from '../core/RuleSyncService';
import { RuleTreeProvider } from '../ui/RuleTreeView';
import { ruleRegistry } from '../core/RuleRegistry';
import { createConfigPanelCommand } from '../ui/ConfigPanel';

/**
 * Registra todos los comandos de la extensión
 */
export function registerCommands(
    context: vscode.ExtensionContext,
    scanner: RuleScanner,
    syncService: RuleSyncService,
    treeProvider: RuleTreeProvider
): void {

    // Comando: Escanear proyecto
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.scanProject', async () => {
            await handleScanProject(scanner, treeProvider);
        })
    );

    // Comando: Sincronizar todas las reglas
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.syncAll', async () => {
            await handleSyncAll(scanner, syncService, treeProvider);
        })
    );

    // Comando: Generar reglas para IA específica
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.syncSpecific', async () => {
            await handleSyncSpecific(scanner, syncService, treeProvider);
        })
    );

    // Comando: Crear Ai_Rules.md
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.createSource', async () => {
            await handleCreateSource(syncService, scanner, treeProvider);
        })
    );

    // Comando: Ver reglas
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.viewRules', async () => {
            await handleViewRules(scanner, syncService);
        })
    );

    // Comando: Refrescar vista
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.refresh', async () => {
            await handleScanProject(scanner, treeProvider);
        })
    );

    // Comando: Abrir archivo
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.openFile', async (uri: vscode.Uri) => {
            await handleOpenFile(uri);
        })
    );

    // Comando: Mostrar panel de configuración
    context.subscriptions.push(
        createConfigPanelCommand()
    );

    // Comando: Consolidar reglas dispersas
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.consolidateRules', async () => {
            await handleConsolidateRules(syncService, scanner, treeProvider);
        })
    );

    // Comando: Forzar sincronización (sin confirmación)
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.forceSyncAll', async () => {
            await handleForceSyncAll(scanner, syncService, treeProvider);
        })
    );

    // Comando: Eliminar todos los archivos de reglas
    context.subscriptions.push(
        vscode.commands.registerCommand('aiRules.deleteAllRules', async () => {
            await handleDeleteAllRules(scanner, treeProvider);
        })
    );
}

/**
 * Handler: Escanear proyecto
 */
async function handleScanProject(
    scanner: RuleScanner,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Scanning project...',
                cancellable: false
            },
            async () => {
                const result = await scanner.scanWorkspace();
                treeProvider.updateScanResult(result);

                const summary = await scanner.getScanSummary();

                let message = `Scan completed:\n`;
                message += `📄 Source: ${summary.hasSource ? 'Found' : '❌ Not found'}\n`;
                message += `✅ Synced: ${summary.syncedRules}\n`;
                message += `⚠️ Outdated: ${summary.outdatedRules}\n`;
                message += `❌ Missing: ${summary.absentRules}`;

                vscode.window.showInformationMessage(message);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error scanning project: ${errorMsg}`);
    }
}

/**
 * Handler: Sincronizar todas las reglas
 */
async function handleSyncAll(
    scanner: RuleScanner,
    syncService: RuleSyncService,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        // Buscar archivo fuente
        const scanResult = await scanner.scanWorkspace();

        if (!scanResult.sourceFile) {
            const action = await vscode.window.showWarningMessage(
                'Ai_Rules.md not found. Do you want to create it?',
                'Create',
                'Cancel'
            );

            if (action === 'Create') {
                await handleCreateSource(syncService, scanner, treeProvider);
            }
            return;
        }

        // Sincronizar
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Synchronizing rules...',
                cancellable: false
            },
            async (progress) => {
                const result = await syncService.syncAll(scanResult.sourceFile!, {
                    askConfirmation: true,
                    addHeader: true
                });

                if (result.success) {
                    vscode.window.showInformationMessage(
                        `✅ Synchronization completed: ${result.syncedFiles.length} file(s) updated`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `⚠️ Synchronization with errors:\n` +
                        `✅ Successful: ${result.syncedFiles.length}\n` +
                        `❌ Fallidos: ${result.failedFiles.length}`
                    );
                }

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error synchronizing: ${errorMsg}`);
    }
}

/**
 * Handler: Generar reglas para IA específica
 */
async function handleSyncSpecific(
    scanner: RuleScanner,
    syncService: RuleSyncService,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        // Buscar archivo fuente
        const scanResult = await scanner.scanWorkspace();

        if (!scanResult.sourceFile) {
            vscode.window.showErrorMessage(
                'No se encontró Ai_Rules.md. Créalo primero con "AI Rules: Crear Ai_Rules.md"'
            );
            return;
        }

        // Mostrar QuickPick para seleccionar IA
        const allDefinitions = ruleRegistry.getAllDefinitions();

        const items = allDefinitions.map(def => ({
            label: `${def.icon} ${def.name}`,
            description: def.filePath,
            detail: def.description,
            aiType: def.id
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select the AI to generate its rules',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) {
            return;
        }

        // Sincronizar la IA seleccionada
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Generando reglas para ${selected.label}...`,
                cancellable: false
            },
            async () => {
                await syncService.syncByAIType(selected.aiType, scanResult.sourceFile!, {
                    askConfirmation: true,
                    addHeader: true
                });

                vscode.window.showInformationMessage(
                    `✅ Reglas generadas para ${selected.label}`
                );

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al generar reglas: ${errorMsg}`);
    }
}

/**
 * Handler: Crear Ai_Rules.md
 */
async function handleCreateSource(
    syncService: RuleSyncService,
    scanner: RuleScanner,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        const uri = await syncService.createSourceFile();

        // Abrir el archivo
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);

        // Preguntar si desea sincronizar
        const action = await vscode.window.showInformationMessage(
            '✅ Ai_Rules.md created successfully!\n\nDo you want to sync these rules with all AI tools now?',
            'Yes, Sync Now',
            'No, Later'
        );

        if (action === 'Yes, Sync Now') {
            // Ejecutar sincronización
            await handleSyncAll(scanner, syncService, treeProvider);
        } else {
            // Solo actualizar vista
            await handleScanProject(scanner, treeProvider);
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (errorMsg.includes('ya existe')) {
            const action = await vscode.window.showWarningMessage(
                'Ai_Rules.md already exists. Do you want to open it?',
                'Open',
                'Cancel'
            );

            if (action === 'Open') {
                await handleViewRules(scanner, syncService);
            }
        } else {
            vscode.window.showErrorMessage(`Error creating Ai_Rules.md: ${errorMsg}`);
        }
    }
}

/**
 * Handler: Ver reglas
 */
async function handleViewRules(
    scanner: RuleScanner,
    syncService: RuleSyncService
): Promise<void> {
    try {
        const scanResult = await scanner.scanWorkspace();

        if (!scanResult.sourceFile) {
            const action = await vscode.window.showWarningMessage(
                'No se encontró Ai_Rules.md. ¿Deseas crearlo?',
                'Crear',
                'Cancelar'
            );

            if (action === 'Crear') {
                const uri = await syncService.createSourceFile();
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document);
            }
            return;
        }

        // Abrir el archivo fuente
        const document = await vscode.workspace.openTextDocument(scanResult.sourceFile);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al abrir reglas: ${errorMsg}`);
    }
}

/**
 * Handler: Abrir archivo
 */
async function handleOpenFile(uri: vscode.Uri): Promise<void> {
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al abrir archivo: ${errorMsg}`);
    }
}

/**
 * Handler: Consolidar reglas dispersas
 */
async function handleConsolidateRules(
    syncService: RuleSyncService,
    scanner: RuleScanner,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        // Escanear primero para ver si hay archivos
        const scanResult = await scanner.scanWorkspace();

        if (scanResult.ruleFiles.length === 0) {
            vscode.window.showWarningMessage(
                'No rule files found to consolidate. ' +
                'Create rules manually first (.cursorrules, CLAUDE.md, etc.)'
            );
            return;
        }

        // Mostrar confirmación con lista de archivos
        const fileList = scanResult.ruleFiles
            .map(f => `• ${path.basename(f.uri.fsPath)}`)
            .join('\n');

        const confirm = await vscode.window.showInformationMessage(
            `${scanResult.ruleFiles.length} rule file(s) will be consolidated:\n\n${fileList}\n\nContinue?`,
            { modal: true },
            'Yes, Consolidate',
            'Cancel'
        );

        if (confirm !== 'Yes, Consolidate') {
            return;
        }

        // Consolidar
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Consolidating scattered rules...',
                cancellable: false
            },
            async () => {
                const uri = await syncService.consolidateRules();

                vscode.window.showInformationMessage(
                    `✅ Rules consolidated successfully in Ai_Rules.md\n` +
                    `Merged ${scanResult.ruleFiles.length} file(s)`
                );

                // Abrir el archivo consolidado
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document);

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (errorMsg.includes('cancelada')) {
            // Usuario canceló, no mostrar error
            return;
        }

        vscode.window.showErrorMessage(`Error consolidating rules: ${errorMsg}`);
    }
}

/**
 * Handler: Forzar sincronización de todas las reglas (sin confirmación)
 */
async function handleForceSyncAll(
    scanner: RuleScanner,
    syncService: RuleSyncService,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        // Buscar archivo fuente
        const scanResult = await scanner.scanWorkspace();

        if (!scanResult.sourceFile) {
            const action = await vscode.window.showWarningMessage(
                'No se encontró Ai_Rules.md. ¿Deseas crearlo?',
                'Crear',
                'Cancelar'
            );

            if (action === 'Crear') {
                await handleCreateSource(syncService, scanner, treeProvider);
            }
            return;
        }

        // Mostrar advertencia antes de forzar
        const confirm = await vscode.window.showWarningMessage(
            '⚠️ Forzar Sincronización\n\n' +
            'Esto sobrescribirá TODOS los archivos de reglas sin preguntar.\n\n' +
            '¿Estás seguro?',
            { modal: true },
            'Sí, forzar',
            'Cancelar'
        );

        if (confirm !== 'Sí, forzar') {
            return;
        }

        // Sincronizar SIN pedir confirmación
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Forcing synchronization...',
                cancellable: false
            },
            async () => {
                const result = await syncService.syncAll(scanResult.sourceFile!, {
                    askConfirmation: false,  // ← La clave: no pedir confirmación
                    addHeader: true
                });

                if (result.success) {
                    vscode.window.showInformationMessage(
                        `⚡ Forced synchronization completed: ${result.syncedFiles.length} file(s) updated`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `⚠️ Synchronization with errors:\n` +
                        `✅ Successful: ${result.syncedFiles.length}\n` +
                        `❌ Failed: ${result.failedFiles.length}`
                    );
                }

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error forcing synchronization: ${errorMsg}`);
    }
}

/**
 * Handler: Eliminar todos los archivos de reglas
 */
async function handleDeleteAllRules(
    scanner: RuleScanner,
    treeProvider: RuleTreeProvider
): Promise<void> {
    try {
        // Escanear archivos existentes
        const scanResult = await scanner.scanWorkspace();

        if (scanResult.ruleFiles.length === 0) {
            vscode.window.showInformationMessage(
                'No rule files found to delete.'
            );
            return;
        }

        // Mostrar lista de archivos a eliminar
        const fileList = scanResult.ruleFiles
            .map(f => `• ${path.basename(f.uri.fsPath)}`)
            .join('\n');

        const confirm = await vscode.window.showWarningMessage(
            `🗑️ Delete Rule Files\n\n` +
            `${scanResult.ruleFiles.length} file(s) will be deleted:\n\n${fileList}\n\n` +
            `⚠️ This action CANNOT be undone.\n\n` +
            `Note: Ai_Rules.md will NOT be deleted.\n\n` +
            `Continue?`,
            { modal: true },
            'Yes, Delete',
            'Cancel'
        );

        if (confirm !== 'Yes, Delete') {
            return;
        }

        // Eliminar archivos
        let deletedCount = 0;
        let failedCount = 0;
        const failedFiles: string[] = [];

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Eliminando archivos de reglas...',
                cancellable: false
            },
            async () => {
                for (const ruleFile of scanResult.ruleFiles) {
                    try {
                        await fs.unlink(ruleFile.uri.fsPath);
                        deletedCount++;
                    } catch (error) {
                        failedCount++;
                        failedFiles.push(path.basename(ruleFile.uri.fsPath));
                        console.error(`Error eliminando ${ruleFile.uri.fsPath}:`, error);
                    }
                }

                // Mostrar resultado
                if (failedCount === 0) {
                    vscode.window.showInformationMessage(
                        `✅ Se eliminaron ${deletedCount} archivo(s) de reglas exitosamente`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `⚠️ Eliminación parcial:\n` +
                        `✅ Eliminados: ${deletedCount}\n` +
                        `❌ Fallidos: ${failedCount}\n\n` +
                        `Archivos no eliminados: ${failedFiles.join(', ')}`
                    );
                }

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al eliminar archivos: ${errorMsg}`);
    }
}
