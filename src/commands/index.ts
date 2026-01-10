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
                title: 'Escaneando proyecto...',
                cancellable: false
            },
            async () => {
                const result = await scanner.scanWorkspace();
                treeProvider.updateScanResult(result);

                const summary = await scanner.getScanSummary();

                let message = `Escaneo completado:\n`;
                message += `📄 Fuente: ${summary.hasSource ? 'Encontrada' : '❌ No encontrada'}\n`;
                message += `✅ Sincronizadas: ${summary.syncedRules}\n`;
                message += `⚠️ Desactualizadas: ${summary.outdatedRules}\n`;
                message += `❌ Ausentes: ${summary.absentRules}`;

                vscode.window.showInformationMessage(message);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al escanear proyecto: ${errorMsg}`);
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
                'No se encontró Ai_Rules.md. ¿Deseas crearlo?',
                'Crear',
                'Cancelar'
            );

            if (action === 'Crear') {
                await handleCreateSource(syncService, scanner, treeProvider);
            }
            return;
        }

        // Sincronizar
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Sincronizando reglas...',
                cancellable: false
            },
            async (progress) => {
                const result = await syncService.syncAll(scanResult.sourceFile!, {
                    askConfirmation: true,
                    addHeader: true
                });

                if (result.success) {
                    vscode.window.showInformationMessage(
                        `✅ Sincronización completada: ${result.syncedFiles.length} archivos actualizados`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `⚠️ Sincronización con errores:\n` +
                        `✅ Exitosos: ${result.syncedFiles.length}\n` +
                        `❌ Fallidos: ${result.failedFiles.length}`
                    );
                }

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al sincronizar: ${errorMsg}`);
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
            placeHolder: 'Selecciona la IA para generar sus reglas',
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

        vscode.window.showInformationMessage(
            '✅ Archivo Ai_Rules.md creado exitosamente'
        );

        // Abrir el archivo
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);

        // Actualizar vista
        await handleScanProject(scanner, treeProvider);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (errorMsg.includes('ya existe')) {
            const action = await vscode.window.showWarningMessage(
                'El archivo Ai_Rules.md ya existe. ¿Deseas abrirlo?',
                'Abrir',
                'Cancelar'
            );

            if (action === 'Abrir') {
                await handleViewRules(scanner, syncService);
            }
        } else {
            vscode.window.showErrorMessage(`Error al crear Ai_Rules.md: ${errorMsg}`);
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
                'No se encontraron archivos de reglas para consolidar. ' +
                'Crea reglas manualmente primero (.cursorrules, CLAUDE.md, etc.)'
            );
            return;
        }

        // Mostrar confirmación con lista de archivos
        const fileList = scanResult.ruleFiles
            .map(f => `• ${path.basename(f.uri.fsPath)}`)
            .join('\n');

        const confirm = await vscode.window.showInformationMessage(
            `Se consolidarán ${scanResult.ruleFiles.length} archivo(s) de reglas:\n\n${fileList}\n\n¿Continuar?`,
            { modal: true },
            'Sí, consolidar',
            'Cancelar'
        );

        if (confirm !== 'Sí, consolidar') {
            return;
        }

        // Consolidar
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Consolidando reglas dispersas...',
                cancellable: false
            },
            async () => {
                const uri = await syncService.consolidateRules();

                vscode.window.showInformationMessage(
                    `✅ Reglas consolidadas exitosamente en Ai_Rules.md\n` +
                    `Se fusionaron ${scanResult.ruleFiles.length} archivos`
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

        vscode.window.showErrorMessage(`Error al consolidar reglas: ${errorMsg}`);
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
                title: 'Forzando sincronización...',
                cancellable: false
            },
            async () => {
                const result = await syncService.syncAll(scanResult.sourceFile!, {
                    askConfirmation: false,  // ← La clave: no pedir confirmación
                    addHeader: true
                });

                if (result.success) {
                    vscode.window.showInformationMessage(
                        `⚡ Sincronización forzada completada: ${result.syncedFiles.length} archivos actualizados`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `⚠️ Sincronización con errores:\n` +
                        `✅ Exitosos: ${result.syncedFiles.length}\n` +
                        `❌ Fallidos: ${result.failedFiles.length}`
                    );
                }

                // Actualizar vista
                await handleScanProject(scanner, treeProvider);
            }
        );
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error al forzar sincronización: ${errorMsg}`);
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
                'No se encontraron archivos de reglas para eliminar.'
            );
            return;
        }

        // Mostrar lista de archivos a eliminar
        const fileList = scanResult.ruleFiles
            .map(f => `• ${path.basename(f.uri.fsPath)}`)
            .join('\n');

        const confirm = await vscode.window.showWarningMessage(
            `🗑️ Eliminar Archivos de Reglas\n\n` +
            `Se eliminarán ${scanResult.ruleFiles.length} archivo(s):\n\n${fileList}\n\n` +
            `⚠️ Esta acción NO se puede deshacer.\n\n` +
            `Nota: Ai_Rules.md NO será eliminado.\n\n` +
            `¿Continuar?`,
            { modal: true },
            'Sí, eliminar',
            'Cancelar'
        );

        if (confirm !== 'Sí, eliminar') {
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
