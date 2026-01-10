# 🤖 AI Rules Manager

**Centralized rule management for multiple AI tools - One source of truth for all your AI assistants**

[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/vscode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.1-green.svg)](https://github.com/ikaladev/ai-rules)

> **Español**: [README.es.md](README.es.md)

---

## 🎯 The Problem

Modern development uses multiple AI tools, each with their own configuration files:
- **Cursor** with `.cursorrules`
- **GitHub Copilot** with `.github/copilot-instructions.md`
- **Windsurf** with `.windsurfrules`
- **Cline** with `.clinerules`
- **Aider** with `.aider.conf.yml`
- **Claude** with `CLAUDE.md`
- And more...

This creates:
- ❌ **Rule duplication** across files
- ❌ **Desynchronization** between tools
- ❌ **Maintenance nightmare** in large projects

---

## ✅ The Solution

**AI Rules Manager** provides:

✨ **Single Source of Truth**: Define rules once in `Ai_Rules.md`  
✨ **Auto-Detection**: Automatically finds existing rule files  
✨ **Smart Sync**: Synchronize to one or all AI tools  
✨ **Visual Control Panel**: Manage everything from a beautiful UI  
✨ **Rule Templates**: Insert pre-made rules for common scenarios  
✨ **Multi-language**: Full support for English and Spanish

---

## 🚀 Key Features

### 🎨 Visual Control Panel
- **Web-based UI** integrated into VS Code
- **One-click actions** for all operations
- **Inline editor** for quick rule edits
- **Collapsible sections** for clean workspace
- **Language selector** (English/Spanish)

### 📚 Rule Template System
- **Pre-built templates** organized by category:
  - General (Clean Code, Performance, etc.)
  - Frontend (React, CSS, Accessibility)
  - Backend (REST APIs, Databases, Auth)
  - Testing (Unit, Integration, E2E)
- **Bilingual content** (English & Spanish)
- **Quick insertion** with preview

### 🔍 Intelligent Scanning
- Automatically detects rule files in your project
- Identifies which AI tool uses each file
- Shows sync status (✅ synced, ⚠️ outdated, ❌ missing)

### 📊 Sidebar TreeView
- Integrated TreeView in file Explorer
- Visual icons for each AI tool
- Click to open files
- Real-time status indicators

### 🔄 Automatic Synchronization
- **Hard sync** (complete copy) of content
- **Auto-generated headers** in target files
- **Confirmation** before overwriting
- **Metadata tracking** in `.vscode/ai-rules.json`

### 🌐 Multi-language Support
- **Auto-detection** of VS Code language
- **Manual selector** in Control Panel footer
- **Localized UI** (all text translates instantly)
- **Localized templates** (inserts in selected language)

---

## 📦 Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for **"AI Rules Manager"**
4. Click **Install**

### From Source (Development)
```bash
git clone https://github.com/ikaladev/ai-rules.git
cd ai-rules-manager
npm install
npm run compile
```

Then press `F5` to open in Extension Development Host.

---

## 🎯 Quick Start

### Method 1: Using Control Panel (Recommended)

1. **Open Control Panel**
   ```
   Cmd/Ctrl + Shift + P → AI Rules: Open Control Panel
   ```

2. **Create source file**
   - Click **"Create Ai_Rules.md"** button
   - Or click **"View Existing Rules"** if file already exists

3. **Edit your rules**
   - Use the inline editor in the panel, or
   - Edit `Ai_Rules.md` directly in your editor

4. **Insert templates** (Optional)
   - Click **"📚 Insert Template"**
   - Choose category (General, Frontend, Backend, Testing)
   - Select template
   - Content inserts at cursor position

5. **Synchronize**
   - Click **"Sync All Rules"** to update all AI tools
   - Or **"Sync Specific AI"** for individual tools

### Method 2: Using Command Palette

1. **Create source file**
   ```
   Cmd/Ctrl + Shift + P → AI Rules: Create Ai_Rules.md
   ```

2. **Edit your rules** in `Ai_Rules.md`:
   ```markdown
   # 🤖 AI Rules

   ## Code Style
   - Use TypeScript
   - Document with JSDoc
   - Prefer clean code

   ## Tech Stack
   - Node.js + TypeScript
   - VS Code
   - Git
   ```

3. **Synchronize**
   ```
   Cmd/Ctrl + Shift + P → AI Rules: Sync All Rules
   ```

✨ **Done!** Your rules are now in:
- `.cursorrules`
- `.github/copilot-instructions.md`
- `.windsurfrules`
- `.clinerules`
- And all others...

---

## 🗂️ Supported AI Tools

| AI Tool | Expected File | Description |
|---------|---------------|-------------|
| 🎯 **Cursor** | `.cursorrules` | Rules for Cursor Editor (chat & Composer) |
| 🐙 **GitHub Copilot** | `.github/copilot-instructions.md` | Project-specific instructions |
| 🏄 **Windsurf** | `.windsurfrules` | Cascade rules for Windsurf (Codeium) |
| 🤖 **Cline** | `.clinerules` | Rules for Cline autonomous agent |
| ⚙️ **Aider** | `.aider.conf.yml` | Configuration for Aider CLI |
| 📋 **Aider Conventions** | `CONVENTIONS.md` | Code conventions for Aider |
| 🧠 **Claude** | `CLAUDE.md` | Instructions for Claude AI |
| 🔮 **Generic Agents** | `agents.md` | Generic rules for multiple agents |

---

## 📸 Screenshots

### Control Panel
*Beautiful glassmorphism UI with all actions in one place*

![Control Panel](docs/Images/IA_Rules_Front.png)

### Inline Editor
*Edit Ai_Rules.md without leaving the panel*

![Inline Editor](docs/Images/IA_Rules_Front_1.png)

### Template Selector
*Insert pre-made rules with one click*

![Sync Dialog](docs/Images/IA_Rules_Sync.png)

### TreeView Sidebar
*See sync status at a glance*

![Delete Dialog](docs/Images/IA_Rules_Delete.png)

---

## ⚙️ How It Works

### 1. Source File
`Ai_Rules.md` is your **single source of truth**. All rules defined here.

### 2. Auto-Detection
The extension scans your workspace and detects:
- If `Ai_Rules.md` exists
- Which rule files already exist
- If they are synced or outdated

### 3. Synchronization
When syncing:
1. Reads content from `Ai_Rules.md`
2. Calculates SHA-256 hash of content
3. Generates AI-specific files with auto-generated header
4. Saves metadata to `.vscode/ai-rules.json`

### 4. State Tracking
Compares hashes to determine if files are:
- ✅ **Synced**: Hash matches
- ⚠️ **Outdated**: Hash differs
- ❌ **Missing**: File doesn't exist

---

## 🛠️ Available Commands

All commands accessible via:
- **Control Panel** (recommended)
- **Command Palette** (`Cmd/Ctrl + Shift + P`)
- **TreeView** context menu

| Command | Description |
|---------|-------------|
| `AI Rules: Open Control Panel` | Opens visual control panel |
| `AI Rules: Create Ai_Rules.md` | Creates source file with template |
| `AI Rules: View Rules` | Opens Ai_Rules.md if exists |
| `AI Rules: Consolidate Scattered Rules` | Merges existing files into Ai_Rules.md |
| `AI Rules: Sync All Rules` | Updates all AI tool files |
| `AI Rules: Sync Specific AI` | Choose which AI to sync |
| `AI Rules: Force Sync` | Overwrites ALL without asking |
| `AI Rules: Scan Project` | Detects existing rule files |
| `AI Rules: Refresh View` | Updates TreeView status |
| `AI Rules: Delete All Rules` | Removes all AI files (not Ai_Rules.md) |

---

## 📚 Template System

### Categories

**📋 General**
- Basic Rules (naming, functions, architecture)
- Clean Code principles
- Performance optimization

**🎨 Frontend**
- React/Next.js best practices
- CSS/Styling guidelines
- Accessibility (a11y) rules

**⚙️ Backend**
- REST API design
- Database management
- Authentication/Authorization

**🧪 Testing**
- Unit testing guidelines
- Integration & E2E testing

### Using Templates

1. Open Control Panel
2. Expand "Rules Editor" section
3. Click **"📚 Insert Template"**
4. Select category
5. Select template
6. Content inserts at end of editor

**Language Note**: Templates insert in the currently selected language (English or Spanish).

---

## 🌐 Multi-language Support

### Features
- ✅ Auto-detects VS Code language on startup
- ✅ Manual language selector in panel footer
- ✅ All UI text translates instantly
- ✅ Templates available in both languages
- ✅ No restart required

### Changing Language
1. Open Control Panel
2. Scroll to footer
3. Use **"Language / Idioma"** dropdown
4. Select English or Español

---

## 🔧 Development

### Requirements
- Node.js 20.x or higher
- VS Code 1.85.0 or higher

### Setup
```bash
# Clone repository
git clone https://github.com/ikaladev/ai-rules.git
cd ai-rules-manager

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (recompiles on save)
npm run watch
```

### Testing the Extension
1. Open project in VS Code
2. Press `F5` to open Extension Development Host
3. Open a test workspace
4. Test commands from palette or Control Panel

### Project Structure
```
ai-rules-manager/
├── src/
│   ├── extension.ts              # Entry point
│   ├── core/
│   │   ├── RuleRegistry.ts       # AI tool mappings
│   │   ├── RuleScanner.ts        # File detection
│   │   └── RuleSyncService.ts    # Synchronization logic
│   ├── ui/
│   │   ├── RuleTreeView.ts       # Sidebar TreeView
│   │   └── ConfigPanel.ts        # Control Panel WebView
│   ├── templates/
│   │   ├── types.ts              # Template interfaces
│   │   ├── general.ts            # General templates
│   │   ├── frontend.ts           # Frontend templates
│   │   ├── backend.ts            # Backend templates
│   │   ├── testing.ts            # Testing templates
│   │   └── index.ts              # Template exports
│   ├── i18n/
│   │   └── uiTranslations.ts     # UI translations (en/es)
│   ├── commands/
│   │   └── index.ts              # Command handlers
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── utils/
│       └── metadata.ts           # Metadata handling
├── package.json                  # Extension config
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## 🧪 Testing

See [TESTING.md](TESTING.md) for detailed test cases.

### Quick Test
1. Create empty folder: `mkdir test-project && cd test-project`
2. Open in Extension Dev Host
3. Open Control Panel
4. Create Ai_Rules.md
5. Add some rules
6. Click "Sync All Rules"
7. Check that 8 files were created
8. Verify TreeView shows all as ✅ Synced

---

## 🤝 Contributing

Contributions are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Ideas
- Add support for more AI tools
- Improve file detection
- Add unit tests
- Improve documentation
- Add more template categories
- Create community template repository

---

## 📝 Roadmap

### v1.0.0 (Current) ✅
- [x] File scanning
- [x] TreeView with status
- [x] Hard sync synchronization
- [x] 8 AI tools supported
- [x] Metadata tracking
- [x] Visual Control Panel
- [x] Rule Template System
- [x] Multi-language support (en/es)

### v1.1.0 (Next Release)
- [ ] Auto file watcher for `Ai_Rules.md`
- [ ] Bidirectional synchronization
- [ ] Custom user templates
- [ ] Template preview before insert
- [ ] Diff viewer before overwrite
- [ ] Keyboard shortcuts

### v2.0.0 (Future)
- [ ] Intelligent rule merging
- [ ] Per-AI custom templates
- [ ] Rule validation & linting
- [ ] Community template library
- [ ] Import/export configurations
- [ ] Template bundles/presets

---

## 🐛 Known Issues

- Extension requires an open workspace
- Does not support multiple workspaces simultaneously
- Hard sync overwrites manual changes (by design)

---

## 💡 FAQ

### What happens if I manually edit a generated file?
Changes will be overwritten on next sync. Always edit `Ai_Rules.md`.

### Can I have AI-specific rules?
Not in v1.0. Future versions will include intelligent merging and per-AI templates.

### Does it work in monorepos?
Yes, detects workspace root.

### Is it cross-platform?
Yes, works on Windows, macOS, and Linux.

### Do I need all AI tools installed?
No, only files for tools you want to use are generated.

### Can I create custom templates?
Not yet, but it's planned for v1.1.0.

### How do I change the UI language?
Open Control Panel, scroll to footer, use the language dropdown.

---

## 🔧 Troubleshooting

### Control Panel doesn't open
- Make sure you have a workspace open (File → Open Folder)
- Try reloading VS Code window (`Cmd/Ctrl + R`)

### Templates not showing
- Check VS Code Developer Console for errors
- Ensure you're running the latest compiled version

### Sync not working
- Verify `Ai_Rules.md` exists and has content
- Check file permissions
- Look at Output panel for error messages

### Language not changing
- Reload the Control Panel after changing language
- Check that uiTranslations.ts compiled correctly

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 👤 Author

**ikaladev**
- GitHub: [@ikaladev](https://github.com/ikaladev)

---

## ⭐ Acknowledgments

Thanks to the VS Code community and all AI tool developers who make this ecosystem possible.

Special thanks to users who provided feedback and feature requests.

---

<div align="center">

**[⬆ Back to top](#-ai-rules-manager)**

Made with ❤️ by the developer community

[![GitHub stars](https://img.shields.io/github/stars/ikaladev/ai-rules?style=social)](https://github.com/ikaladev/ai-rules)
[![Twitter Follow](https://img.shields.io/twitter/follow/ikaladev?style=social)](https://twitter.com/ikaladev)

</div>
