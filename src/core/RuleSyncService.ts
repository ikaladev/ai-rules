/**
 * RuleSyncService - Sincronización de reglas entre archivo fuente y destinos
 * 
 * Este módulo maneja la sincronización del contenido de Ai_Rules.md
 * hacia los diferentes archivos de configuración de IAs.
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SyncOptions, SyncResult } from '../types';
import { ruleRegistry } from './RuleRegistry';
import { MetadataService } from '../utils/metadata';
import { RuleScanner } from './RuleScanner';

/**
 * Servicio de sincronización de reglas
 */
export class RuleSyncService {
    private metadataService: MetadataService;
    private scanner: RuleScanner;
    private workspaceRoot: string;

    constructor(metadataService: MetadataService, scanner: RuleScanner) {
        this.metadataService = metadataService;
        this.scanner = scanner;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No hay workspace abierto');
        }
        this.workspaceRoot = workspaceFolder.uri.fsPath;
    }

    /**
     * Sincroniza todas las reglas desde el archivo fuente
     */
    async syncAll(sourceUri: vscode.Uri, options?: SyncOptions): Promise<SyncResult> {
        const result: SyncResult = {
            success: true,
            syncedFiles: [],
            failedFiles: []
        };

        try {
            // Leer contenido del archivo fuente
            const sourceContent = await fs.readFile(sourceUri.fsPath, 'utf-8');
            const sourceHash = await this.scanner.calculateFileHash(sourceUri);

            // Obtener todas las definiciones de IAs
            const allDefinitions = ruleRegistry.getAllDefinitions();

            // Filtrar según opciones
            const definitionsToSync = options?.aiTypes
                ? allDefinitions.filter(def => options.aiTypes!.includes(def.id))
                : allDefinitions;

            // Sincronizar cada IA
            for (const definition of definitionsToSync) {
                try {
                    await this.syncSingle(
                        definition.id,
                        definition.filePath,
                        sourceContent,
                        sourceHash,
                        options
                    );
                    result.syncedFiles.push(definition.filePath);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    result.failedFiles.push(`${definition.filePath}: ${errorMsg}`);
                    result.success = false;
                }
            }

            return result;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                syncedFiles: [],
                failedFiles: [],
                error: errorMsg
            };
        }
    }

    /**
     * Sincroniza un archivo específico de IA
     */
    async syncSingle(
        aiType: string,
        targetPath: string,
        content: string,
        sourceHash: string,
        options?: SyncOptions
    ): Promise<void> {
        const fullPath = path.join(this.workspaceRoot, targetPath);

        // Verificar si el archivo existe
        const fileExists = await this.fileExists(fullPath);

        // Solicitar confirmación si es necesario
        if (fileExists && options?.askConfirmation !== false) {
            const confirmed = await this.confirmOverwrite(targetPath);
            if (!confirmed) {
                throw new Error('Sincronización cancelada por el usuario');
            }
        }

        // Generar contenido con encabezado
        const finalContent = options?.addHeader !== false
            ? this.addHeader(content)
            : content;

        // Asegurar que existe el directorio
        await this.ensureDirectory(fullPath);

        // Escribir el archivo
        await fs.writeFile(fullPath, finalContent, 'utf-8');

        // Actualizar metadata
        await this.metadataService.updateTargetMetadata(
            aiType,
            targetPath,
            sourceHash
        );
    }

    /**
     * Sincroniza un tipo de IA específico
     */
    async syncByAIType(
        aiType: string,
        sourceUri: vscode.Uri,
        options?: SyncOptions
    ): Promise<void> {
        const definition = ruleRegistry.getDefinition(aiType);

        if (!definition) {
            throw new Error(`Tipo de IA no soportado: ${aiType}`);
        }

        const sourceContent = await fs.readFile(sourceUri.fsPath, 'utf-8');
        const sourceHash = await this.scanner.calculateFileHash(sourceUri);

        await this.syncSingle(
            definition.id,
            definition.filePath,
            sourceContent,
            sourceHash,
            options
        );
    }

    /**
     * Crea el archivo fuente Ai_Rules.md con una plantilla
     */
    async createSourceFile(): Promise<vscode.Uri> {
        const sourceFileName = 'Ai_Rules.md';
        const sourcePath = path.join(this.workspaceRoot, sourceFileName);

        // Verificar si ya existe
        if (await this.fileExists(sourcePath)) {
            throw new Error('El archivo Ai_Rules.md ya existe');
        }

        // Crear contenido de plantilla
        const template = this.getSourceTemplate();

        // Escribir el archivo
        await fs.writeFile(sourcePath, template, 'utf-8');

        // Actualizar metadata
        const metadata = await this.metadataService.readMetadata();
        metadata.sourcePath = sourceFileName;
        await this.metadataService.writeMetadata(metadata);

        return vscode.Uri.file(sourcePath);
    }

    /**
     * Consolida reglas dispersas en múltiples archivos en un único Ai_Rules.md
     * Útil para migración cuando ya tienes archivos de reglas existentes
     */
    async consolidateRules(): Promise<vscode.Uri> {
        const sourceFileName = 'Ai_Rules.md';
        const sourcePath = path.join(this.workspaceRoot, sourceFileName);

        // Verificar si ya existe Ai_Rules.md
        if (await this.fileExists(sourcePath)) {
            const overwrite = await vscode.window.showWarningMessage(
                'Ai_Rules.md ya existe. ¿Deseas sobrescribirlo con las reglas consolidadas?',
                { modal: true },
                'Sí, sobrescribir',
                'No, cancelar'
            );

            if (overwrite !== 'Sí, sobrescribir') {
                throw new Error('Consolidación cancelada por el usuario');
            }
        }

        // Escanear archivos de reglas existentes
        const scanResult = await this.scanner.scanWorkspace();

        if (scanResult.ruleFiles.length === 0) {
            throw new Error('No se encontraron archivos de reglas para consolidar');
        }

        // Construir contenido consolidado
        let consolidatedContent = this.getConsolidationHeader();

        // Agregar cada archivo encontrado
        for (const ruleFile of scanResult.ruleFiles) {
            const definition = ruleRegistry.getDefinition(ruleFile.aiType);
            const fileName = path.basename(ruleFile.uri.fsPath);

            try {
                const content = await fs.readFile(ruleFile.uri.fsPath, 'utf-8');

                // Limpiar encabezado automático si existe
                const cleanContent = this.removeAutoGeneratedHeader(content);

                // Agregar sección para esta IA
                consolidatedContent += `\n## 📁 Reglas de ${definition?.name || ruleFile.aiType}\n\n`;
                consolidatedContent += `> Consolidado desde: \`${fileName}\`\n\n`;
                consolidatedContent += cleanContent + '\n\n';
                consolidatedContent += '---\n';
            } catch (error) {
                console.error(`Error leyendo ${fileName}:`, error);
                // Continuar con los demás archivos
            }
        }

        // Agregar footer
        consolidatedContent += this.getConsolidationFooter(scanResult.ruleFiles.length);

        // Escribir el archivo consolidado
        await fs.writeFile(sourcePath, consolidatedContent, 'utf-8');

        // Actualizar metadata
        const metadata = await this.metadataService.readMetadata();
        metadata.sourcePath = sourceFileName;
        await this.metadataService.writeMetadata(metadata);

        return vscode.Uri.file(sourcePath);
    }

    /**
     * Obtiene el encabezado para archivo consolidado
     */
    private getConsolidationHeader(): string {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

        return `# 🤖 Reglas de IA - Consolidadas

Este archivo fue generado automáticamente consolidando reglas dispersas encontradas en el proyecto.

**Fecha de consolidación**: ${timestamp}

---

## 💡 Qué hacer ahora

1. **Revisa** el contenido consolidado abajo
2. **Edita** y organiza las reglas como prefieras
3. **Sincroniza** para propagar cambios: ejecuta "AI Rules: Sincronizar todas las reglas"
4. **(Opcional)** Elimina los archivos originales si ya no los necesitas

---

`;
    }

    /**
     * Obtiene el footer para archivo consolidado
     */
    private getConsolidationFooter(filesCount: number): string {
        return `\n\n---

## ✨ Consolidación Completada

Se consolidaron **${filesCount} archivos** de reglas en este documento.

**Próximos pasos sugeridos**:
- Organiza y limpia reglas duplicadas
- Agrega reglas específicas para tu proyecto
- Ejecuta "AI Rules: Sincronizar todas las reglas" para aplicar cambios

---

*Este es ahora tu archivo fuente de verdad para todas las herramientas de IA*
`;
    }

    /**
     * Remueve encabezado generado automáticamente de un archivo
     */
    private removeAutoGeneratedHeader(content: string): string {
        // Detectar y remover encabezado generado automáticamente
        const headerPattern = /^#\s*⚠️\s*Archivo generado automáticamente[\s\S]*?---\s*\n\n/;
        return content.replace(headerPattern, '').trim();
    }

    /**
     * Agrega un encabezado automático al contenido
     */
    private addHeader(content: string): string {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

        const header = `# ⚠️ Archivo generado automáticamente
# Fuente: Ai_Rules.md
# Fecha: ${timestamp}
# No editar directamente - los cambios se sobrescribirán
# 
# Para actualizar estas reglas, edita Ai_Rules.md y ejecuta:
# "AI Rules: Sincronizar todas las reglas"

---

`;

        return header + content;
    }

    /**
     * Solicita confirmación al usuario para sobrescribir un archivo
     */
    private async confirmOverwrite(filePath: string): Promise<boolean> {
        const answer = await vscode.window.showWarningMessage(
            `El archivo ${filePath} ya existe. ¿Deseas sobrescribirlo?`,
            { modal: true },
            'Sí',
            'No'
        );

        return answer === 'Sí';
    }

    /**
     * Asegura que existe el directorio para un archivo
     */
    private async ensureDirectory(filePath: string): Promise<void> {
        const directory = path.dirname(filePath);
        await fs.mkdir(directory, { recursive: true });
    }

    /**
     * Verifica si un archivo existe
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Obtiene la plantilla para el archivo fuente
     */
    private getSourceTemplate(): string {
        return `# 🤖 Reglas de IA - Fuente de Verdad

Este archivo es la **fuente única de verdad** para todas las reglas de IA en este proyecto.

Los cambios aquí se sincronizan automáticamente a:
- Cursor (.cursorrules)
- GitHub Copilot (.github/copilot-instructions.md)
- Windsurf (.windsurfrules)
- Cline (.clinerules)
- Aider (.aider.conf.yml)
- Claude (CLAUDE.md)
- Agentes genéricos (agents.md)

## 📋 Reglas Generales

### Estilo de Código
- Usar TypeScript para todo el código nuevo
- Seguir convenciones de nomenclatura camelCase
- Documentar funciones públicas con JSDoc
- Mantener funciones pequeñas y enfocadas

### Arquitectura
- Separación de responsabilidades
- Componentes reutilizables
- Inyección de dependencias donde sea apropiado

### Testing
- Escribir tests unitarios para lógica de negocio
- Mantener cobertura > 80%

### Documentación
- README actualizado
- Comentarios en español
- Documentar decisiones importantes

## 🎯 Tech Stack

- **Runtime**: Node.js
- **Lenguaje**: TypeScript
- **IDE**: Visual Studio Code
- **Control de versiones**: Git

## 💡 Preferencias de IA

- Explicar el razonamiento detrás de las sugerencias
- Priorizar código limpio y mantenible sobre optimización prematura
- Sugerir mejores prácticas y patrones de diseño cuando sea relevante
- Detectar y advertir sobre posibles bugs o problemas de seguridad

---

✨ **Tip**: Sincroniza estos cambios ejecutando "AI Rules: Sincronizar todas las reglas" desde la paleta de comandos.
`;
    }
}

/**
 * Crea una instancia del servicio de sincronización
 */
export function createRuleSyncService(
    metadataService: MetadataService,
    scanner: RuleScanner
): RuleSyncService {
    return new RuleSyncService(metadataService, scanner);
}
