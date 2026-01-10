# 🧪 Testing Guide for AI Rules Manager

This guide will help you test the extension in development mode.

> **Español**: Ver documentación en español en versión anterior o contactar al autor

---

## 🚀 Initial Setup

### 1. Install Dependencies
```bash
cd ai-rules-manager
npm install
```

### 2. Compile Project
```bash
npm run compile
```

Or in watch mode:
```bash
npm run watch
```

---

## 🎯 How to Test the Extension

### Method 1: From VS Code (Recommended)

1. **Open project** in VS Code
   ```bash
   code ai-rules-manager
   ```

2. **Press F5** to open Extension Development Host
   - This opens a new VS Code window with the extension loaded

3. **Open a test workspace**
   - File → Open Folder
   - Select any project folder

4. **Execute commands**
   - Cmd/Ctrl + Shift + P
   - Search for "AI Rules"
   - Test all commands

### Method 2: Using Control Panel

1. Press `F5` to open Extension Dev Host
2. Open a test folder
3. `Cmd/Ctrl + Shift + P` → "AI Rules: Open Control Panel"
4. Test all UI features

---

## ✅ Test Cases

### Test 1: Empty Project

**Goal**: Verify behavior in project without rules

**Steps**:
1. Create empty folder: `mkdir test-project && cd test-project`
2. Open in Extension Dev Host
3. Execute "AI Rules: Scan Project"

**Expected Result**:
- TreeView shows "⚠️ Ai_Rules.md not found"
- No rule files detected

---

### Test 2: Create Source File

**Goal**: Verify Ai_Rules.md creation

**Steps**:
1. Execute "AI Rules: Create Ai_Rules.md"
2. Verify file opened
3. Verify template content

**Expected Result**:
- File `Ai_Rules.md` created in root
- File opened in editor
- Contains sections template

---

### Test 3: Control Panel

**Goal**: Verify Control Panel functionality

**Steps**:
1. Execute "AI Rules: Open Control Panel"
2. Verify panel renders
3. Test all buttons

**Expected Result**:
- Panel opens in webview
- All sections visible
- Buttons respond to clicks

---

### Test 4: Template Insertion

**Goal**: Verify template system

**Steps**:
1. Open Control Panel
2. Expand "Rules Editor"
3. Click "📚 Insert Template"
4. Select category (e.g., Frontend)
5. Select template (e.g., React/Next.js)

**Expected Result**:
- QuickPick shows categories
- Second QuickPick shows templates
- Template content inserts at end of editor
- Success notification appears

---

### Test 5: Language Switch

**Goal**: Verify multi-language support

**Steps**:
1. Open Control Panel
2. Note current language
3. Scroll to footer
4. Change language in dropdown
5. Verify UI updates

**Expected Result**:
- All text translates instantly
- Panel reloads with new language
- Editor content preserved

---

### Test 6: Sync All Rules

**Goal**: Verify mass synchronization

**Steps**:
1. Execute "AI Rules: Sync All Rules" (or use Control Panel)
2. Accept overwrite if asked
3. Verify created files

**Expected Result**:
- 8 files created:
  - `.cursorrules`
  - `.github/copilot-instructions.md`
  - `.windsurfrules`
  - `.clinerules`
  - `.aider.conf.yml`
  - `CONVENTIONS.md`
  - `CLAUDE.md`
  - `agents.md`
- Each file has auto-generated header
- Success notification
- TreeView shows all as ✅ Synced

---

### Test 7: Verify Headers

**Goal**: Verify files have correct header

**Steps**:
1. Open `.cursorrules`
2. Verify first lines

**Expected Result**:
```markdown
# ⚠️ Auto-generated file
# Source: Ai_Rules.md
# Date: 2026-01-09 22:34:06
# Do not edit directly - changes will be overwritten
# 
# To update these rules, edit Ai_Rules.md and run:
# "AI Rules: Sync All Rules"

---

[CONTENT FROM AI_RULES.MD]
```

---

### Test 8: Detect Desynchronization

**Goal**: Verify change detection

**Steps**:
1. Edit `Ai_Rules.md` (add new line)
2. Save
3. Execute "AI Rules: Refresh View"

**Expected Result**:
- TreeView shows all files as ⚠️ Outdated

---

### Test 9: Specific Sync

**Goal**: Verify single AI synchronization

**Steps**:
1. Execute "AI Rules: Generate rules for specific AI"
2. Select "🎯 Cursor"
3. Confirm overwrite

**Expected Result**:
- Only `.cursorrules` updates
- TreeView shows Cursor as ✅ Synced
- Others remain ⚠️ Outdated

---

### Test 10: TreeView

**Goal**: Verify TreeView functionality

**Steps**:
1. Open "AI Rules Manager" view in sidebar
2. Click each node

**Expected Result**:
- Click "📄 Ai_Rules.md" → Opens file
- Click AI rules → Opens corresponding file
- Icons show correct status:
  - ✅ = Green
  - ⚠️ = Yellow
  - ❌ = Red

---

### Test 11: Metadata

**Goal**: Verify metadata persistence

**Steps**:
1. Sync rules
2. Open `.vscode/ai-rules.json`
3. Verify content

**Expected Result**:
```json
{
  "sourcePath": "Ai_Rules.md",
  "targets": {
    "cursor": {
      "path": ".cursorrules",
      "lastSyncHash": "abc123...",
      "lastSyncDate": "2026-01-09T22:34:06-05:00"
    },
    ...
  }
}
```

---

### Test 12: Overwrite Confirmation

**Goal**: Verify confirmation prompt

**Steps**:
1. Manually edit `.cursorrules`
2. Execute "AI Rules: Sync All Rules"

**Expected Result**:
- Shows dialog: "File .cursorrules already exists. Overwrite?"
- Options: "Yes" / "No"
- If "No" → Cancels sync
- If "Yes" → Overwrites file

---

## 🐛 Debugging

### View Console Logs

1. In Extension Development Host
2. Help → Toggle Developer Tools
3. Console tab
4. Look for "AI Rules Manager" messages

### Breakpoints

1. Add breakpoints in TypeScript code
2. Press F5
3. Execute commands
4. Debugger stops at breakpoints

---

## 📊 Complete Checklist

- [ ] Test 1: Empty project
- [ ] Test 2: Create source file
- [ ] Test 3: Control Panel
- [ ] Test 4: Template insertion
- [ ] Test 5: Language switch
- [ ] Test 6: Sync all
- [ ] Test 7: Verify headers
- [ ] Test 8: Detect desync
- [ ] Test 9: Specific sync
- [ ] Test 10: TreeView
- [ ] Test 11: Metadata
- [ ] Test 12: Overwrite confirmation

---

## 🎯 Success Metrics

✅ **All tests pass**  
✅ **No errors in console**  
✅ **UI responds correctly**  
✅ **Files created correctly**  
✅ **Metadata persists**

---

## 🚀 Next Step: Package

Once all tests pass:

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package

# Result: ai-rules-manager-1.0.0.vsix
```

---

Good luck with testing! 🎉
