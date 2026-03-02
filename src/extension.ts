import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnvVariable } from './types';
import { Storage } from './storage';
import { EnvVariableProvider, EnvVariableItem } from './envVariableProvider';

const VAR_NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function validateVariableName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return 'Variable name cannot be empty.';
  }
  if (!VAR_NAME_PATTERN.test(name.trim())) {
    return 'Variable name must contain only uppercase letters, numbers, and underscores, and must not start with a digit.';
  }
  return undefined;
}

async function promptVariableInput(existing?: EnvVariable): Promise<EnvVariable | undefined> {
  const name = await vscode.window.showInputBox({
    title: existing ? 'Edit Variable Name' : 'New Variable Name',
    prompt: 'Uppercase letters, numbers, and underscores only (e.g. API_KEY)',
    value: existing?.name ?? '',
    validateInput: validateVariableName
  });
  if (name === undefined) {
    return undefined;
  }

  const value = await vscode.window.showInputBox({
    title: existing ? 'Edit Variable Value' : 'New Variable Value',
    prompt: 'Enter the value for this variable',
    value: existing?.value ?? ''
  });
  if (value === undefined) {
    return undefined;
  }

  const description = await vscode.window.showInputBox({
    title: 'Description (optional)',
    prompt: 'Enter an optional description',
    value: existing?.description ?? ''
  });
  if (description === undefined) {
    return undefined;
  }

  const category = await vscode.window.showInputBox({
    title: 'Category / Tag (optional)',
    prompt: 'Enter an optional category or tag (e.g. Auth, Database)',
    value: existing?.category ?? ''
  });
  if (category === undefined) {
    return undefined;
  }

  return {
    id: existing?.id ?? generateId(),
    name: name.trim(),
    value,
    description: description.trim() || undefined,
    category: category.trim() || undefined
  };
}

async function getEnvFilePath(): Promise<string | undefined> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder is open. Please open a folder first.');
    return undefined;
  }
  return path.join(folders[0].uri.fsPath, '.env');
}

async function injectVariableToEnvFile(variable: EnvVariable): Promise<void> {
  const envFilePath = await getEnvFilePath();
  if (!envFilePath) {
    return;
  }

  const uri = vscode.Uri.file(envFilePath);
  const line = `${variable.name}=${variable.value}`;
  const wsEdit = new vscode.WorkspaceEdit();

  if (fs.existsSync(envFilePath)) {
    const rawContent = fs.readFileSync(envFilePath, 'utf8');

    // Check for duplicate by variable name
    const existingLines = rawContent.split('\n');
    const duplicate = existingLines.some(l => {
      const trimmed = l.trim();
      if (trimmed.startsWith('#') || !trimmed.includes('=')) {
        return false;
      }
      const existingName = trimmed.split('=')[0].trim();
      return existingName === variable.name;
    });

    if (duplicate) {
      vscode.window.showWarningMessage(
        `"${variable.name}" already exists in .env and was not added again.`
      );
      return;
    }

    // Append below existing content, ensuring a newline separator
    const endsWithNewline = rawContent.endsWith('\n');
    const insertText = endsWithNewline ? `${line}\n` : `\n${line}\n`;
    const document = await vscode.workspace.openTextDocument(uri);
    const endPosition = document.lineAt(document.lineCount - 1).range.end;
    wsEdit.insert(uri, endPosition, insertText);
  } else {
    // Create the file with the variable
    wsEdit.createFile(uri, { ignoreIfExists: false });
    wsEdit.insert(uri, new vscode.Position(0, 0), `${line}\n`);
  }

  const success = await vscode.workspace.applyEdit(wsEdit);
  if (success) {
    await vscode.workspace.openTextDocument(uri);
    vscode.window.showInformationMessage(`"${variable.name}" injected into .env successfully.`);
  } else {
    vscode.window.showErrorMessage(`Failed to update .env file.`);
  }
}

async function exportAllVariables(storage: Storage): Promise<void> {
  const variables = storage.getVariables();
  if (variables.length === 0) {
    vscode.window.showWarningMessage('No variables stored in .env Warehouse to export.');
    return;
  }

  const envFilePath = await getEnvFilePath();
  if (!envFilePath) {
    return;
  }

  const uri = vscode.Uri.file(envFilePath);
  const lines = variables.map(v => `${v.name}=${v.value}`).join('\n') + '\n';
  const wsEdit = new vscode.WorkspaceEdit();

  if (fs.existsSync(envFilePath)) {
    const document = await vscode.workspace.openTextDocument(uri);
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      document.lineAt(document.lineCount - 1).range.end
    );
    // Append all non-duplicate variables
    const rawContent = document.getText();
    const existingNames = new Set(
      rawContent.split('\n')
        .filter(l => {
          const t = l.trim();
          return t && !t.startsWith('#') && t.includes('=');
        })
        .map(l => l.split('=')[0].trim())
    );

    const newLines = variables
      .filter(v => !existingNames.has(v.name))
      .map(v => `${v.name}=${v.value}`)
      .join('\n');

    if (!newLines) {
      vscode.window.showWarningMessage('All variables already exist in the .env file.');
      return;
    }

    const endsWithNewline = rawContent.endsWith('\n');
    const insertText = endsWithNewline ? `${newLines}\n` : `\n${newLines}\n`;
    const endPosition = document.lineAt(document.lineCount - 1).range.end;
    wsEdit.insert(uri, endPosition, insertText);
  } else {
    wsEdit.createFile(uri, { ignoreIfExists: false });
    wsEdit.insert(uri, new vscode.Position(0, 0), lines);
  }

  const success = await vscode.workspace.applyEdit(wsEdit);
  if (success) {
    vscode.window.showInformationMessage(
      `All variables exported to .env successfully.`
    );
  } else {
    vscode.window.showErrorMessage('Failed to export variables to .env file.');
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const storage = new Storage(context);
  const provider = new EnvVariableProvider(storage);

  const treeView = vscode.window.createTreeView('envWarehouse', {
    treeDataProvider: provider,
    showCollapseAll: false
  });

  const addCmd = vscode.commands.registerCommand('envWarehouse.addVariable', async () => {
    const variable = await promptVariableInput();
    if (!variable) {
      return;
    }
    await storage.addVariable(variable);
    provider.refresh();
    vscode.window.showInformationMessage(`Variable "${variable.name}" added to .env Warehouse.`);
  });

  const editCmd = vscode.commands.registerCommand(
    'envWarehouse.editVariable',
    async (item: EnvVariableItem) => {
      const updated = await promptVariableInput(item.variable);
      if (!updated) {
        return;
      }
      await storage.updateVariable(item.variable.id, {
        name: updated.name,
        value: updated.value,
        description: updated.description,
        category: updated.category
      });
      provider.refresh();
      vscode.window.showInformationMessage(`Variable "${updated.name}" updated.`);
    }
  );

  const deleteCmd = vscode.commands.registerCommand(
    'envWarehouse.deleteVariable',
    async (item: EnvVariableItem) => {
      const answer = await vscode.window.showWarningMessage(
        `Delete variable "${item.variable.name}"?`,
        { modal: true },
        'Delete'
      );
      if (answer !== 'Delete') {
        return;
      }
      await storage.deleteVariable(item.variable.id);
      provider.refresh();
      vscode.window.showInformationMessage(`Variable "${item.variable.name}" deleted.`);
    }
  );

  const exportCmd = vscode.commands.registerCommand('envWarehouse.exportAll', async () => {
    await exportAllVariables(storage);
  });

  const injectCmd = vscode.commands.registerCommand(
    'envWarehouse.injectVariable',
    async (item: EnvVariableItem) => {
      await injectVariableToEnvFile(item.variable);
    }
  );

  context.subscriptions.push(treeView, addCmd, editCmd, deleteCmd, exportCmd, injectCmd);
}

export function deactivate(): void {
  // nothing to clean up
}
