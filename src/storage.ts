import * as vscode from 'vscode';
import { EnvVariable } from './types';

const STORAGE_KEY = 'envWarehouse.variables';

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
}
