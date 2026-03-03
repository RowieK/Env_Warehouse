import * as vscode from 'vscode';
import { EnvVariable, EnvFolder } from './types';
const STORAGE_KEY = 'envWarehouse.variables';
const FOLDERS_KEY = 'envWarehouse.folders';

export class Storage {
  constructor(private readonly context: vscode.ExtensionContext) {}

    getVariables(): EnvVariable[] {
    return this.context.globalState.get<EnvVariable[]>(STORAGE_KEY, []);
  }

  async saveVariables(variables: EnvVariable[]): Promise<void> {
    await this.context.globalState.update(STORAGE_KEY, variables);
  }

  async addVariable(variable: EnvVariable): Promise<void> {
    const variables = this.getVariables();
    variables.push(variable);
    await this.saveVariables(variables);
  }

  async updateVariable(id: string, updated: Partial<Omit<EnvVariable, 'id'>>): Promise<void> {
    const variables = this.getVariables();
    const index = variables.findIndex(v => v.id === id);
    if (index !== -1) {
      variables[index] = { ...variables[index], ...updated };
      await this.saveVariables(variables);
    }
  }

  async deleteVariable(id: string): Promise<void> {
    const variables = this.getVariables().filter(v => v.id !== id);
    await this.saveVariables(variables);
  }

  searchVariables(query: string): EnvVariable[] {
    const q = (query || '').trim().toLowerCase();
    const all = this.getVariables();
    if (!q) return all;

    type Scored = { v: EnvVariable; score: number };
    const scored: Scored[] = all.map(v => {
      let score = 0;
      const name = (v.name || '').toLowerCase();
      const value = (v.value || '').toLowerCase();
      const desc = (v.description || '').toLowerCase();
      const cat = (v.category || '').toLowerCase();

      if (name === q) score += 200;
      if (value === q) score += 150;

      if (name.startsWith(q)) score += 80;
      if (value.startsWith(q)) score += 60;
      if (desc.startsWith(q)) score += 40;
      if (cat.startsWith(q)) score += 30;

      if (name.includes(q)) score += 50;
      if (value.includes(q)) score += 40;
      if (desc.includes(q)) score += 20;
      if (cat.includes(q)) score += 15;

      const lenDiff = Math.abs(name.length - q.length);
      score += Math.max(0, 10 - Math.min(10, lenDiff));

      return { v, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.v);
  }

  // Folder APIs
  getFolderVariables(folderId: string): EnvVariable[] {
    const folder = this.getFolderById(folderId);
    return folder?.variables || [];
  }
  
  getFolders(): EnvFolder[] {
    return this.context.globalState.get<EnvFolder[]>(FOLDERS_KEY, []);
  }

  async saveFolders(folders: EnvFolder[]): Promise<void> {
    await this.context.globalState.update(FOLDERS_KEY, folders);
  }

  async addFolder(folder: EnvFolder): Promise<void> {
    const folders = this.getFolders();
    folders.push(folder);
    await this.saveFolders(folders);
  }

  async updateFolder(id: string, updated: Partial<Omit<EnvFolder, 'id' | 'variables'>> & { variables?: EnvVariable[] }): Promise<void> {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index !== -1) {
      folders[index] = { ...folders[index], ...updated };
      await this.saveFolders(folders);
    }
  }

  async deleteFolder(id: string): Promise<void> {
    const folders = this.getFolders().filter(f => f.id !== id);
    await this.saveFolders(folders);
  }

  async addVariableToFolder(folderId: string, variable: EnvVariable): Promise<void> {
    const folders = this.getFolders();
    const idx = folders.findIndex(f => f.id === folderId);
    if (idx !== -1) {
      folders[idx].variables.push(variable);
      await this.saveFolders(folders);
    }
  }

  async removeVariableFromFolder(folderId: string, variableId: string): Promise<void> {
    const folders = this.getFolders();
    const idx = folders.findIndex(f => f.id === folderId);
    if (idx !== -1) {
      folders[idx].variables = folders[idx].variables.filter(v => v.id !== variableId);
      await this.saveFolders(folders);
    }
  }

  getFolderById(id: string): EnvFolder | undefined {
    return this.getFolders().find(f => f.id === id);
  }
}
