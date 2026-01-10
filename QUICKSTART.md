# 🚀 Quick Start - AI Rules Manager

The fastest way to try the extension.

> **Español**: Ver guía en español en README.es.md

---

## ⚡ In 3 Steps

### 1️⃣ Open in VS Code

```bash
cd /path/to/ai-rules-manager
code .
```

### 2️⃣ Press F5

This compiles and opens an "Extension Development Host" window with the extension loaded.

### 3️⃣ Create test workspace

In the new window:
- File → Open Folder
- Create new folder: `test-ai-rules`
- Open that folder

---

## ✨ Commands to Try

Press `Cmd/Ctrl + Shift + P` and execute:

### 1. Open Control Panel (Recommended)
```
AI Rules: Open Control Panel
```

This opens the visual interface where you can:
- Create/edit Ai_Rules.md
- Insert templates
- Sync rules
- See sync status

### 2. Create source file
```
AI Rules: Create Ai_Rules.md
```

### 3. Edit rules

The file will open automatically. Edit content or leave as is.

### 4. Insert Template (Optional)

In Control Panel:
1. Expand "Rules Editor"
2. Click "📚 Insert Template"
3. Choose category (Frontend, Backend, etc.)
4. Select template
5. Content inserts automatically

### 5. Synchronize

```
AI Rules: Sync All Rules
```

### 6. View results

Open "**AI Rules Manager**" view in Explorer sidebar.

You'll see:
- 📄 Ai_Rules.md (Source)
- ✅ 🎯 Cursor (.cursorrules)
- ✅ 🐙 GitHub Copilot (.github/copilot-instructions.md)
- ✅ 🏄 Windsurf (.windsurfrules)
- ... and 5 more

---

## 🎯 What to Verify?

✅ Files created in project:
```
test-ai-rules/
├── Ai_Rules.md
├── .cursorrules
├── .github/
│   └── copilot-instructions.md
├── .windsurfrules
├── .clinerules
├── .aider.conf.yml
├── CONVENTIONS.md
├── CLAUDE.md
└── agents.md
```

✅ Metadata in `.vscode/ai-rules.json`

✅ TreeView shows all as ✅ Synced

✅ Each file has auto-generated header

---

## 🌐 Test Multi-language

1. Open Control Panel
2. Scroll to footer
3. Change language dropdown (English ↔ Español)
4. See all text translate instantly
5. Insert a template in the new language

---

## 🐛 View Debug Output

If any issues:

1. Help → Toggle Developer Tools
2. Console tab
3. Look for "AI Rules Manager"

---

## 📖 More Information

- Full documentation: [README.md](README.md)
- Test cases: [TESTING.md](TESTING.md)
- Spanish docs: [README.es.md](README.es.md)

---

**Ready to test! 🎉**
