import * as vscode from 'vscode';
import { EnvFolder, EnvVariable } from './types';
import { Storage } from './storage';

export class EnvVariableItem extends vscode.TreeItem {
  constructor(public readonly variable: EnvVariable) {
    super(variable.name, vscode.TreeItemCollapsibleState.None);

    const parts: string[] = [];
    if (variable.category) {
      parts.push(`[${variable.category}]`);
    }
    if (variable.description) {
      parts.push(variable.description);
    }
    this.description = parts.join(' ') || undefined;

    this.tooltip = new vscode.MarkdownString(
      `**${variable.name}**\n\n` +
      `Value: \`${variable.value}\`` +
      (variable.description ? `\n\nDescription: ${variable.description}` : '') +
      (variable.category ? `\n\nCategory: ${variable.category}` : '')
    );

    this.contextValue = 'envVariable';
  }
}

export class EnvVariableProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly storage: Storage) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element instanceof EnvFolderItem) {
      // return variables inside this folder
      return element.folder.variables.map(v => new EnvVariableItem(v));
    }

    // top-level: folders first, then ungrouped variables
    const folders = this.storage.getFolders().map(f => new EnvFolderItem(f));
    const variables = this.storage.getVariables().map(v => new EnvVariableItem(v) as vscode.TreeItem);
    return [...folders, ...variables];
  }
}

export class EnvFolderItem extends vscode.TreeItem {
  constructor(public readonly folder: EnvFolder) {
    super(folder.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = 'envFolder';
    this.description = `${folder.variables.length} variables`;
  }
}