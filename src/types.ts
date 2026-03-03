export interface EnvVariable {
  id: string;
  name: string;
  value: string;
  description?: string;
  category?: string;
}
export interface EnvFolder {
  id: string;
  name: string;
  variables: EnvVariable[];
}