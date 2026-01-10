/**
 * Extension.ts - Punto de entrada de la extensión AI Rules Manager
 * 
 * Esta extensión permite gestionar reglas de IA de forma centralizada,
 * sincronizando un archivo fuente (Ai_Rules.md) con múltiples archivos
 * de configuración de diferentes herramientas de IA.
 */

import * as vscode from 'vscode';
import { createMetadataService } from './utils/metadata';
import { createRuleScanner } from './core/RuleScanner';
import { createRuleSyncService } from './core/RuleSyncService';
import { createRuleTreeView } from './ui/RuleTreeView';
import { registerCommands } from './commands';

/**
 * Se ejecuta cuando la extensión se activa
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('AI Rules Manager activado');

    // Verificar que hay un workspace abierto
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(
            'AI Rules Manager requiere un workspace abierto para funcionar'
        );
        return;
    }

    try {
        // Inicializar servicios
        const metadataService = createMetadataService();

        if (!metadataService) {
            vscode.window.showErrorMessage(
                'No se pudo inicializar AI Rules Manager: No hay workspace'
            );
            return;
        }

        const scanner = createRuleScanner(metadataService);
        const syncService = createRuleSyncService(metadataService, scanner);

        // Crear TreeView
        const { provider: treeProvider, view: treeView } = createRuleTreeView(context);

        // Registrar comandos
        registerCommands(context, scanner, syncService, treeProvider);

        // Escaneo inicial (opcional - comentado para no ser intrusivo)
        // Puedes descomentar si quieres que escanee automáticamente al activarse
        /*
        scanner.scanWorkspace().then(result => {
          treeProvider.updateScanResult(result);
        });
        */

        // Mostrar mensaje de bienvenida (solo la primera vez)
        const hasShownWelcome = context.globalState.get('aiRules.hasShownWelcome', false);
        if (!hasShownWelcome) {
            showWelcomeMessage(context);
        }

        console.log('AI Rules Manager inicializado correctamente');
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(
            `Error al inicializar AI Rules Manager: ${errorMsg}`
        );
    }
}

/**
 * Se ejecuta cuando la extensión se desactiva
 */
export function deactivate() {
    console.log('AI Rules Manager desactivado');
}

/**
 * Muestra mensaje de bienvenida
 */
async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
    const action = await vscode.window.showInformationMessage(
        '🤖 ¡Bienvenido a AI Rules Manager! Gestiona tus reglas de IA desde un único archivo.',
        'Comenzar',
        'Más tarde'
    );

    if (action === 'Comenzar') {
        const hasAiRules = await vscode.workspace.findFiles('**/Ai_Rules.md', '**/node_modules/**');

        if (hasAiRules.length === 0) {
            const createAction = await vscode.window.showInformationMessage(
                '¿Deseas crear el archivo Ai_Rules.md para comenzar?',
                'Sí, crear',
                'No, gracias'
            );

            if (createAction === 'Sí, crear') {
                await vscode.commands.executeCommand('aiRules.createSource');
            }
        } else {
            await vscode.commands.executeCommand('aiRules.scanProject');
        }
    }

    // Marcar que ya se mostró el mensaje de bienvenida
    context.globalState.update('aiRules.hasShownWelcome', true);
}
