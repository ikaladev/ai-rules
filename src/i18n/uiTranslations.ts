/**
 * UI Translations - Traducciones para el Panel de Control
 */

export const uiTranslations = {
    es: {
        title: 'Panel de Control',
        description: 'Gestión centralizada de reglas de IA',
        quickStart: {
            title: 'Inicio Rápido',
            create: {
                title: 'Crear Ai_Rules.md',
                desc: 'Crea el archivo fuente con plantilla inicial'
            },
            view: {
                title: 'Ver Reglas Existentes',
                desc: 'Abre Ai_Rules.md si ya existe'
            },
            consolidate: {
                title: 'Consolidar Reglas Dispersas',
                desc: 'Fusiona archivos existentes en Ai_Rules.md'
            }
        },
        sync: {
            title: 'Sincronización',
            all: {
                title: 'Sincronizar Todas las Reglas',
                desc: 'Actualiza todos los archivos de IAs'
            },
            specific: {
                title: 'Sincronizar IA Específica',
                desc: 'Elige qué IA sincronizar'
            },
            force: {
                title: 'Forzar Sincronización',
                desc: 'Sobrescribe TODOS sin preguntar'
            }
        },
        tools: {
            title: 'Herramientas',
            scan: {
                title: 'Escanear Proyecto',
                desc: 'Detecta archivos de reglas existentes'
            },
            refresh: {
                title: 'Refrescar Vista',
                desc: 'Actualiza el estado de sincronización'
            },
            delete: {
                title: 'Eliminar Archivos de Reglas',
                desc: '⚠️ Elimina TODOS (excepto Ai_Rules.md)'
            }
        },
        editor: {
            title: 'Editor de Reglas',
            expand: 'Click para expandir/colapsar',
            filename: 'Ai_Rules.md',
            buttons: {
                template: '📚 Insertar Plantilla',
                reload: '🔄 Recargar',
                save: '💾 Guardar'
            },
            placeholder: {
                text: 'El contenido de Ai_Rules.md aparecerá aquí...',
                noFile: 'Ai_Rules.md no existe',
                createFirst: 'Crea el archivo primero usando el botón "Crear Ai_Rules.md" abajo'
            },
            info: 'Los cambios se guardan en Ai_Rules.md. Recuerda <strong>sincronizar</strong> después de editar para propagar a las demás IAs.'
        },
        footer: {
            madeBy: 'Hecho con ❤️ por ikaladev',
            language: 'Idioma / Language'
        },
        messages: {
            saved: '✅ Ai_Rules.md guardado exitosamente',
            templateInserted: (name: string) => `✅ Plantilla "${name}" insertada`,
            error: (msg: string) => `Error: ${msg}`,
            noWorkspace: 'No hay workspace abierto'
        }
    },
    en: {
        title: 'Control Panel',
        description: 'Centralized AI rules management',
        quickStart: {
            title: 'Quick Start',
            create: {
                title: 'Create Ai_Rules.md',
                desc: 'Creates source file with initial template'
            },
            view: {
                title: 'View Existing Rules',
                desc: 'Opens Ai_Rules.md if it exists'
            },
            consolidate: {
                title: 'Consolidate Scattered Rules',
                desc: 'Merges existing files into Ai_Rules.md'
            }
        },
        sync: {
            title: 'Synchronization',
            all: {
                title: 'Sync All Rules',
                desc: 'Updates all AI files'
            },
            specific: {
                title: 'Sync Specific AI',
                desc: 'Choose which AI to sync'
            },
            force: {
                title: 'Force Synchronization',
                desc: 'Overwrites ALL without asking'
            }
        },
        tools: {
            title: 'Tools',
            scan: {
                title: 'Scan Project',
                desc: 'Detects existing rule files'
            },
            refresh: {
                title: 'Refresh View',
                desc: 'Updates synchronization status'
            },
            delete: {
                title: 'Delete Rule Files',
                desc: '⚠️ Deletes ALL (except Ai_Rules.md)'
            }
        },
        editor: {
            title: 'Rules Editor',
            expand: 'Click to expand/collapse',
            filename: 'Ai_Rules.md',
            buttons: {
                template: '📚 Insert Template',
                reload: '🔄 Reload',
                save: '💾 Save'
            },
            placeholder: {
                text: 'Ai_Rules.md content will appear here...',
                noFile: 'Ai_Rules.md does not exist',
                createFirst: 'Create the file first using the "Create Ai_Rules.md" button below'
            },
            info: 'Changes are saved to Ai_Rules.md. Remember to <strong>sync</strong> after editing to propagate to other AIs.'
        },
        footer: {
            madeBy: 'Made with ❤️ by ikaladev',
            language: 'Change Language'
        },
        messages: {
            saved: '✅ Ai_Rules.md saved successfully',
            templateInserted: (name: string) => `✅ Template "${name}" inserted`,
            error: (msg: string) => `Error: ${msg}`,
            noWorkspace: 'No workspace open'
        }
    }
};
