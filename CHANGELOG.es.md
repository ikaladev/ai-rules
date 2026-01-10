# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

> **English**: [CHANGELOG.md](CHANGELOG.md)

## [1.0.1] - 2026-01-10

### 🐛 Corregido
- **Detección de archivos case-insensitive**: El scanner ahora detecta archivos de reglas sin importar mayúsculas/minúsculas (ej. `agents.md`, `AGENTS.md`, `Agents.md`)
- **Idioma de plantilla por defecto**: La plantilla de `Ai_Rules.md` ahora está en inglés por defecto

### ✨ Agregado
- **Diálogo de auto-sincronización**: Después de crear `Ai_Rules.md`, se pregunta al usuario si desea sincronizar con todas las IAs
- **Localización completa en inglés**: Todos los mensajes, diálogos y descripciones visibles están ahora en inglés por defecto
- **Screenshots reales**: La documentación ahora incluye capturas reales de la extensión en lugar de placeholders

### 🔧 Cambiado
- Todos los mensajes de UI traducidos al inglés (operaciones de escaneo, sincronización, consolidación, eliminación)
- Descripciones de herramientas de IA en QuickPick ahora en inglés
- Mensajes de bienvenida y notificaciones de error en inglés
- Se mantiene soporte bilingüe a través del selector de idioma en el Panel de Control

---

## [1.0.0] - 2026-01-09

### ✨ Agregado
- Escaneo automático de archivos de reglas en el workspace
- TreeView en el sidebar con vista de todas las reglas
- Comandos principales:
  - `AI Rules: Escanear proyecto`
  - `AI Rules: Sincronizar todas las reglas`
  - `AI Rules: Generar reglas para IA específica`
  - `AI Rules: Crear Ai_Rules.md`
  - `AI Rules: Ver reglas`
  - `AI Rules: Refrescar vista`
  - `AI Rules: Abrir Panel de Control`
  - `AI Rules: Consolidar Reglas Dispersas`
  - `AI Rules: Forzar Sincronización`
  - `AI Rules: Eliminar Todos los Archivos de Reglas`
- Soporte para 8 herramientas de IA:
  - Cursor (`.cursorrules`)
  - GitHub Copilot (`.github/copilot-instructions.md`)
  - Windsurf (`.windsurfrules`)
  - Cline (`.clinerules`)
  - Aider (`.aider.conf.yml`)
  - Aider Conventions (`CONVENTIONS.md`)
  - Claude (`CLAUDE.md`)
  - Agentes genéricos (`agents.md`)
- Sincronización hard sync con encabezados automáticos
- Tracking de estado con hashes SHA-256
- Metadata persistida en `.vscode/ai-rules.json`
- Indicadores visuales de estado:
  - ✅ Sincronizado
  - ⚠️ Desactualizado
  - ❌ Ausente
- Confirmación antes de sobrescribir archivos existentes
- Plantilla inicial para `Ai_Rules.md`
- Mensaje de bienvenida para nuevos usuarios
- **Panel de Control Visual** con diseño glassmorphism
- **Sistema de Plantillas de Reglas**:
  - 4 categorías (General, Frontend, Backend, Testing)
  - 11 plantillas predefinidas
  - Contenido bilingüe (Inglés y Español)
  - Inserción rápida con vista previa
- **Soporte Multi-idioma**:
  - Auto-detección del idioma de VS Code
  - Selector manual de idioma
  - UI localizada (Inglés/Español)
  - Plantillas localizadas

### 🛠️ Técnico
- Arquitectura modular con separación de responsabilidades
- TypeScript con tipos estrictos
- Sin dependencias externas (solo VS Code API y Node.js stdlib)
- Cross-platform (Windows, macOS, Linux)
- Manejo robusto de errores
- Notificaciones claras al usuario

### 📚 Documentación
- README completo con ejemplos
- Todo el código comentado
- Tipos TypeScript documentados
- Guía de desarrollo local
- Documentación bilingüe (Inglés y Español)

---

## [Unreleased]

### 🔮 Planeado para v1.1.0
- File watcher automático para `Ai_Rules.md`
- Sincronización bidireccional
- Editor visual de reglas
- Snippets de reglas comunes
- Soporte para más IAs
- Plantillas de usuario personalizadas
- Vista previa de plantilla antes de insertar
- Atajos de teclado

### 🔮 Planeado para v2.0.0
- Fusión inteligente de reglas
- Plantillas personalizadas por tipo de IA
- Validación y linting de reglas
- Biblioteca de reglas compartidas
- Importar/exportar configuraciones
- Bundles/presets de plantillas
