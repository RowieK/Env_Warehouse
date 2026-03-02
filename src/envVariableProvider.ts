import * as vscode from 'vscode';
import { EnvVariable } from './types';
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

export class EnvVariableProvider implements vscode.TreeDataProvider<EnvVariableItem> {
  private readonly _onDidChangeTreeData =
    new vscode.EventEmitter<EnvVariableItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly storage: Storage) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: EnvVariableItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: EnvVariableItem): vscode.ProviderResult<EnvVariableItem[]> {
    if (element) {
      return [];
    }
    const variables = this.storage.getVariables();
    return variables.map(v => new EnvVariableItem(v));
  }
}
