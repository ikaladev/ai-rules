/**
 * WebviewPanel - Panel de configuración visual con botones y editor inline
 * 
 * Este módulo crea una interfaz visual con botones para todas las
 * funcionalidades de la extensión, además de un editor inline para Ai_Rules.md
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { templateCategories } from '../templates';
import { uiTranslations } from '../i18n/uiTranslations';

type Language = 'es' | 'en';

/**
 * Crea y muestra el panel de configuración
 */
export function createConfigPanelCommand(): vscode.Disposable {
  return vscode.commands.registerCommand('aiRules.showConfigPanel', () => {
    showConfigPanel();
  });
}

// Variable global para mantener referencia al panel activo
let currentPanel: vscode.WebviewPanel | undefined;
let currentLanguage: Language = 'es'; // Idioma por defecto

/**
 * Muestra el panel de configuración
 */
function showConfigPanel(): void {
  // Si ya hay un panel abierto, mostrarlo en lugar de crear uno nuevo
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.One);
    return;
  }

  // Detectar idioma del entorno VS Code
  const vscodeLang = vscode.env.language;
  currentLanguage = vscodeLang.startsWith('en') ? 'en' : 'es';

  // Crear el panel
  const panel = vscode.window.createWebviewPanel(
    'aiRulesConfig',
    '🤖 AI Rules Manager - Panel de Control',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  currentPanel = panel;

  // Limpiar referencia cuando se cierre
  panel.onDidDispose(() => {
    currentPanel = undefined;
  });

  // Establecer el contenido HTML
  panel.webview.html = getWebviewContent(currentLanguage);

  // Cargar contenido inicial
  loadEditorContent(panel);

  // Manejar mensajes desde el webview
  panel.webview.onDidReceiveMessage(
    async message => {
      switch (message.command) {
        case 'createSource':
          await vscode.commands.executeCommand('aiRules.createSource');
          // Recargar contenido después de crear
          await loadEditorContent(panel);
          break;

        case 'viewRules':
          vscode.commands.executeCommand('aiRules.viewRules');
          break;

        case 'consolidateRules':
          await vscode.commands.executeCommand('aiRules.consolidateRules');
          // Recargar contenido después de consolidar
          await loadEditorContent(panel);
          break;

        case 'scanProject':
          vscode.commands.executeCommand('aiRules.scanProject');
          break;

        case 'syncAll':
          vscode.commands.executeCommand('aiRules.syncAll');
          break;

        case 'syncSpecific':
          vscode.commands.executeCommand('aiRules.syncSpecific');
          break;

        case 'forceSyncAll':
          vscode.commands.executeCommand('aiRules.forceSyncAll');
          break;

        case 'deleteAllRules':
          vscode.commands.executeCommand('aiRules.deleteAllRules');
          break;

        case 'refresh':
          vscode.commands.executeCommand('aiRules.refresh');
          break;

        case 'loadContent':
          await loadEditorContent(panel);
          break;

        case 'saveContent':
          await saveEditorContent(message.content);
          break;

        case 'showTemplateSelector':
          await showTemplateSelector(panel);
          break;

        case 'changeLanguage':
          if (message.content === 'es' || message.content === 'en') {
            currentLanguage = message.content;
            panel.webview.html = getWebviewContent(currentLanguage);
            loadEditorContent(panel);
          }
          break;
      }
    },
    undefined,
    []
  );
}

/**
 * Carga el contenido de Ai_Rules.md en el editor
 */
async function loadEditorContent(panel: vscode.WebviewPanel): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      panel.webview.postMessage({
        command: 'setContent',
        content: '',
        exists: false,
        error: 'No hay workspace abierto'
      });
      return;
    }

    const sourceFile = path.join(workspaceFolder.uri.fsPath, 'Ai_Rules.md');

    try {
      const content = await fs.readFile(sourceFile, 'utf-8');
      panel.webview.postMessage({
        command: 'setContent',
        content: content,
        exists: true
      });
    } catch {
      // Archivo no existe
      panel.webview.postMessage({
        command: 'setContent',
        content: '',
        exists: false
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    panel.webview.postMessage({
      command: 'setContent',
      content: '',
      exists: false,
      error: errorMsg
    });
  }
}

/**
 * Guarda el contenido editado en Ai_Rules.md
 */
async function saveEditorContent(content: string): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No hay workspace abierto');
      return;
    }

    const sourceFile = path.join(workspaceFolder.uri.fsPath, 'Ai_Rules.md');

    await fs.writeFile(sourceFile, content, 'utf-8');

    vscode.window.showInformationMessage('✅ Ai_Rules.md guardado exitosamente');

    // Refrescar la vista del TreeView
    await vscode.commands.executeCommand('aiRules.refresh');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Error al guardar: ${errorMsg}`);
  }
}

/**
 * Muestra selector de plantillas y devuelve el contenido seleccionado
 */
async function showTemplateSelector(panel: vscode.WebviewPanel): Promise<void> {
  try {
    // Paso 1: Seleccionar categoría
    const categoryItems = templateCategories.map(cat => ({
      label: `${cat.icon} ${cat.names[currentLanguage]}`,
      description: cat.descriptions[currentLanguage],
      category: cat
    }));

    const selectedCategory = await vscode.window.showQuickPick(categoryItems, {
      placeHolder: currentLanguage === 'es' ? 'Selecciona una categoría de plantillas' : 'Select a rule template category',
      title: currentLanguage === 'es' ? '📚 Plantillas de Reglas' : '📚 Rule Templates'
    });

    if (!selectedCategory) {
      return;
    }

    // Paso 2: Seleccionar plantilla
    const templateItems = selectedCategory.category.templates.map(template => ({
      label: template[currentLanguage].name,
      description: template[currentLanguage].description,
      template: template
    }));

    const categoryName = selectedCategory.category.names[currentLanguage];

    const selectedTemplate = await vscode.window.showQuickPick(templateItems, {
      placeHolder: currentLanguage === 'es'
        ? `Selecciona una plantilla de ${categoryName}`
        : `Select a template from ${categoryName}`,
      title: `${selectedCategory.category.icon} ${categoryName}`
    });

    if (!selectedTemplate) {
      return;
    }

    // Paso 3: Enviar contenido al webview para insertar
    panel.webview.postMessage({
      command: 'insertTemplate',
      content: selectedTemplate.template[currentLanguage].content
    });

    const templateName = selectedTemplate.template[currentLanguage].name;
    const msg = currentLanguage === 'es'
      ? `✅ Plantilla "${templateName}" insertada`
      : `✅ Template "${templateName}" inserted`;

    vscode.window.showInformationMessage(msg);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const msg = currentLanguage === 'es'
      ? `Error al seleccionar plantilla: ${errorMsg}`
      : `Error selecting template: ${errorMsg}`;
    vscode.window.showErrorMessage(msg);
  }
}

/**
 * Genera el contenido HTML del webview
 */
/**
 * Genera el contenido HTML del webview
 */
function getWebviewContent(language: Language = 'es'): string {
  const t = uiTranslations[language];

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Rules Manager</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--vscode-panel-border);
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: var(--vscode-textLink-foreground);
    }

    .header p {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    @media (max-width: 900px) {
      .main-content {
        grid-template-columns: 1fr;
      }
    }

    .editor-section {
      grid-column: 1 / -1;
      margin-bottom: 20px;
    }

    .section {
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: var(--vscode-textLink-foreground);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section p {
      margin-bottom: 15px;
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn {
      padding: 10px 16px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-family: var(--vscode-font-family);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .btn:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-primary {
      background-color: var(--vscode-button-background);
    }

    .btn-secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-icon {
      font-size: 18px;
      width: 20px;
      text-align: center;
    }

    .btn-text {
      flex: 1;
    }

    .btn-description {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 2px;
    }

    /* Editor styles */
    .editor-container {
      margin-top: 15px;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      cursor: pointer;
      padding: 10px 16px;
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 4px;
      border: none;
      transition: all 0.2s;
    }

    .editor-header:hover {
      background-color: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .editor-header:active {
      transform: translateY(0);
    }

    .editor-title {
      font-size: 14px;
      font-weight: bold;
      color: var(--vscode-textLink-foreground);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .expand-icon {
      transition: transform 0.2s;
      font-size: 12px;
    }

    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    .editor-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .editor-content.expanded {
      max-height: 2000px;
      transition: max-height 0.3s ease-in;
    }

    .editor-actions {
      display: flex;
      gap: 8px;
    }

    .editor-btn {
      padding: 6px 12px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .editor-btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .editor-btn.save {
      background-color: var(--vscode-button-background);
    }

    .editor-btn.reload {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    #editor {
      width: 100%;
      min-height: 400px;
      padding: 15px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
    }

    #editor:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }

    #editor:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .editor-placeholder {
      padding: 40px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
      background-color: var(--vscode-input-background);
      border: 1px dashed var(--vscode-input-border);
      border-radius: 4px;
    }

    .editor-placeholder h3 {
      margin-bottom: 10px;
      color: var(--vscode-textLink-foreground);
    }

    .status-indicator {
      display: inline-block;
      padding: 3px 10px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 10px;
      font-size: 11px;
      font-weight: bold;
    }

    .info-box {
      padding: 12px;
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textLink-foreground);
      margin: 15px 0;
      border-radius: 4px;
      font-size: 12px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid var(--vscode-panel-border);
      text-align: center;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 10px;
    }

    .language-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 5px;
    }

    .lang-select {
      background-color: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      padding: 4px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI Rules Manager</h1>
      <p>${t.description}</p>
      <div style="margin-top: 10px;">
        <span class="status-indicator">v1.0.0</span>
      </div>
    </div>

    <!-- Editor Inline (Colapsable) -->
    <div class="section editor-section">
      <div class="editor-header" onclick="toggleEditor()">
        <div class="editor-title">
          <span class="expand-icon" id="expandIcon">▶</span>
          <span>📝 ${t.editor.title}</span>
        </div>
        <div style="font-size: 12px; color: var(--vscode-descriptionForeground);">
          ${t.editor.expand}
        </div>
      </div>
      
      <div class="editor-content" id="editorContent">
        <p style="margin: 15px 0; color: var(--vscode-descriptionForeground); font-size: 13px;">
          ${t.description}
        </p>
        
        <div class="editor-container" id="editorContainer">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 13px; font-weight: bold;">Ai_Rules.md</div>
            <div class="editor-actions">
              <button class="editor-btn reload" onclick="showTemplates()">${t.editor.buttons.template}</button>
              <button class="editor-btn reload" onclick="loadContent()">${t.editor.buttons.reload}</button>
              <button class="editor-btn save" onclick="saveContent()">${t.editor.buttons.save}</button>
            </div>
          </div>
          <textarea id="editor" placeholder="${t.editor.placeholder.text}"></textarea>
        </div>

        <div class="editor-placeholder" id="editorPlaceholder" style="display:none;">
          <h3>📄 ${t.editor.placeholder.noFile}</h3>
          <p>${t.editor.placeholder.createFirst}</p>
        </div>

        <div class="info-box">
          💡 ${t.editor.info}
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Inicio Rápido -->
      <div class="section">
        <h2>🚀 ${t.quickStart.title}</h2>
        <div class="button-group">
          <button class="btn btn-secondary" onclick="executeCommand('createSource')">
            <span class="btn-icon">📝</span>
            <div class="btn-text">
              <div>${t.quickStart.create.title}</div>
              <div class="btn-description">${t.quickStart.create.desc}</div>
            </div>
          </button>
          
          <button class="btn btn-secondary" onclick="executeCommand('viewRules')">
            <span class="btn-icon">👁️</span>
            <div class="btn-text">
              <div>${t.quickStart.view.title}</div>
              <div class="btn-description">${t.quickStart.view.desc}</div>
            </div>
          </button>
          
          <button class="btn btn-secondary" onclick="executeCommand('consolidateRules')">
            <span class="btn-icon">📂</span>
            <div class="btn-text">
              <div>${t.quickStart.consolidate.title}</div>
              <div class="btn-description">${t.quickStart.consolidate.desc}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Sincronización -->
      <div class="section">
        <h2>🔄 ${t.sync.title}</h2>
        <div class="button-group">
          <button class="btn btn-secondary" onclick="executeCommand('syncAll')">
            <span class="btn-icon">⚡</span>
            <div class="btn-text">
              <div>${t.sync.all.title}</div>
              <div class="btn-description">${t.sync.all.desc}</div>
            </div>
          </button>
          
          <button class="btn btn-secondary" onclick="executeCommand('syncSpecific')">
            <span class="btn-icon">🎯</span>
            <div class="btn-text">
              <div>${t.sync.specific.title}</div>
              <div class="btn-description">${t.sync.specific.desc}</div>
            </div>
          </button>
          
          <button class="btn btn-secondary" onclick="executeCommand('forceSyncAll')">
            <span class="btn-icon">🔥</span>
            <div class="btn-text">
              <div>${t.sync.force.title}</div>
              <div class="btn-description">${t.sync.force.desc}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Herramientas -->
      <div class="section">
        <h2>🔧 ${t.tools.title}</h2>
        <div class="button-group">
          <button class="btn btn-secondary" onclick="executeCommand('scanProject')">
            <span class="btn-icon">🔍</span>
            <div class="btn-text">
              <div>${t.tools.scan.title}</div>
              <div class="btn-description">${t.tools.scan.desc}</div>
            </div>
          </button>
          
          <button class="btn btn-secondary" onclick="executeCommand('refresh')">
            <span class="btn-icon">🔄</span>
            <div class="btn-text">
              <div>${t.tools.refresh.title}</div>
              <div class="btn-description">${t.tools.refresh.desc}</div>
            </div>
          </button>
          
          <button class="btn btn-secondary" onclick="executeCommand('deleteAllRules')">
            <span class="btn-icon">🗑️</span>
            <div class="btn-text">
              <div>${t.tools.delete.title}</div>
              <div class="btn-description">${t.tools.delete.desc}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>${t.footer.madeBy}</p>
      
      <div class="language-selector">
        <label for="language">${t.footer.language}:</label>
        <select id="language" class="lang-select" onchange="changeLanguage(this.value)">
          <option value="es" ${language === 'es' ? 'selected' : ''}>Español</option>
          <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
        </select>
      </div>
      
      <p style="margin-top: 5px;">MIT License</p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let hasUnsavedChanges = false;
    let editorExpanded = false;

    function toggleEditor() {
      editorExpanded = !editorExpanded;
      const content = document.getElementById('editorContent');
      const icon = document.getElementById('expandIcon');
      
      if (editorExpanded) {
        content.classList.add('expanded');
        icon.classList.add('expanded');
      } else {
        content.classList.remove('expanded');
        icon.classList.remove('expanded');
      }
    }

    function executeCommand(command) {
      vscode.postMessage({
        command: command
      });
    }

    function loadContent() {
      vscode.postMessage({
        command: 'loadContent'
      });
    }

    function saveContent() {
      const editor = document.getElementById('editor');
      const content = editor.value;
      
      vscode.postMessage({
        command: 'saveContent',
        content: content
      });

      hasUnsavedChanges = false;
    }

    function showTemplates() {
      vscode.postMessage({
        command: 'showTemplateSelector'
      });
    }
    
    function changeLanguage(lang) {
      vscode.postMessage({
        command: 'changeLanguage',
        content: lang
      });
    }

    // Detectar cambios
    document.getElementById('editor').addEventListener('input', () => {
      hasUnsavedChanges = true;
    });

    // Atajo de teclado Ctrl+S / Cmd+S
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
      }
    });

    // Recibir mensajes desde la extensión
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.command) {
        case 'setContent':
          const editor = document.getElementById('editor');
          const editorContainer = document.getElementById('editorContainer');
          const placeholder = document.getElementById('editorPlaceholder');

          if (message.exists) {
            editor.value = message.content;
            editor.disabled = false;
            editorContainer.style.display = 'block';
            placeholder.style.display = 'none';
            hasUnsavedChanges = false;
          } else {
            editor.value = '';
            editor.disabled = true;
            editorContainer.style.display = 'none';
            placeholder.style.display = 'block';
          }
          break;

        case 'insertTemplate':
          const editorEl = document.getElementById('editor');
          // Insertar al final con doble salto de línea
          const currentContent = editorEl.value;
          const separator = currentContent.trim() ? '\\n\\n' : '';
          editorEl.value = currentContent + separator + message.content;
          hasUnsavedChanges = true;
          
          // Expandir editor si está colapsado
          if (!editorExpanded) {
            toggleEditor();
          }
          
          // Scroll al final
          editorEl.scrollTop = editorEl.scrollHeight;
          break;
      }
    });

    // Cargar contenido inicial
    loadContent();
  </script>
</body>
</html>`;
}
