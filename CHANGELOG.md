# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

> **Español**: [CHANGELOG.es.md](CHANGELOG.es.md)

## [1.0.1] - 2026-01-10

### 🐛 Fixed
- **Case-insensitive file detection**: Scanner now detects rule files regardless of case (e.g., `agents.md`, `AGENTS.md`, `Agents.md`)
- **Default template language**: `Ai_Rules.md` template is now in English by default

### ✨ Added
- **Auto-sync dialog**: After creating `Ai_Rules.md`, users are prompted to sync with all AI tools
- **Complete English localization**: All user-facing messages, dialogs, and descriptions are now in English by default
- **Real screenshots**: Documentation now includes actual extension screenshots instead of placeholders

### 🔧 Changed
- All UI messages translated to English (scan, sync, consolidate, delete operations)
- AI tool descriptions in QuickPick now in English
- Welcome messages and error notifications in English
- Maintained bilingual support through Control Panel language selector

---

## [1.0.0] - 2026-01-09

### ✨ Added
- Automatic scanning of rule files in workspace
- Sidebar TreeView with all rules visualization
- Main commands:
  - `AI Rules: Scan Project`
  - `AI Rules: Sync All Rules`
  - `AI Rules: Generate rules for specific AI`
  - `AI Rules: Create Ai_Rules.md`
  - `AI Rules: View Rules`
  - `AI Rules: Refresh View`
  - `AI Rules: Open Control Panel`
  - `AI Rules: Consolidate Scattered Rules`
  - `AI Rules: Force Sync`
  - `AI Rules: Delete All Rule Files`
- Support for 8 AI tools:
  - Cursor (`.cursorrules`)
  - GitHub Copilot (`.github/copilot-instructions.md`)
  - Windsurf (`.windsurfrules`)
  - Cline (`.clinerules`)
  - Aider (`.aider.conf.yml`)
  - Aider Conventions (`CONVENTIONS.md`)
  - Claude (`CLAUDE.md`)
  - Generic agents (`agents.md`)
- Hard sync synchronization with auto-generated headers
- State tracking with SHA-256 hashes
- Metadata persisted in `.vscode/ai-rules.json`
- Visual status indicators:
  - ✅ Synced
  - ⚠️ Outdated
  - ❌ Missing
- Confirmation before overwriting existing files
- Initial template for `Ai_Rules.md`
- Welcome message for new users
- **Visual Control Panel** with glassmorphism design
- **Rule Template System**:
  - 4 categories (General, Frontend, Backend, Testing)
  - 11 pre-built templates
  - Bilingual content (English & Spanish)
  - Quick insertion with preview
- **Multi-language support**:
  - Auto-detection of VS Code language
  - Manual language selector
  - Localized UI (English/Spanish)
  - Localized templates

### 🛠️ Technical
- Modular architecture with separation of concerns
- TypeScript with strict types
- No external dependencies (VS Code API and Node.js stdlib only)
- Cross-platform (Windows, macOS, Linux)
- Robust error handling
- Clear user notifications

### 📚 Documentation
- Complete README with examples
- All code commented
- Documented TypeScript types
- Local development guide
- Bilingual documentation (English & Spanish)

---

## [Unreleased]

### 🔮 Planned for v1.1.0
- Automatic file watcher for `Ai_Rules.md`
- Bidirectional synchronization
- Visual rule editor
- Common rule snippets
- Support for more AI tools
- Custom user templates
- Template preview before insert
- Keyboard shortcuts

### 🔮 Planned for v2.0.0
- Intelligent rule merging
- Custom templates per AI type
- Rule validation and linting
- Shared rule library
- Import/export configurations
- Template bundles/presets
