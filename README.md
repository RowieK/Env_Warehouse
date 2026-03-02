# .env Warehouse

A professional Visual Studio Code extension to securely store and manage reusable `.env` variables in a sidebar.

## Features

- **Sidebar view** – Activity Bar icon opens a clean tree view of all stored variables.
- **Add / Edit / Delete** – Manage variables with name, value, optional description, and optional category/tag.
- **Inject to .env** – Click the `→` button on any variable to instantly add it to the `.env` file in your workspace root. The file is created if it doesn't exist.
- **Duplicate protection** – Variables already present in `.env` (by name) are never duplicated.
- **Export all** – Export every stored variable to `.env` in one click.
- **Persistent storage** – Variables are saved with VSCode's `globalState` and survive restarts.

## Variable Name Rules

Names must match `^[A-Z_][A-Z0-9_]*$` — uppercase letters, numbers, and underscores only (e.g. `API_KEY`, `DB_HOST`).

## Project Structure

```
.
├── src/
│   ├── extension.ts            # Extension entry point & command handlers
│   ├── envVariableProvider.ts  # TreeDataProvider for the sidebar
│   ├── storage.ts              # globalState persistence layer
│   └── types.ts                # EnvVariable interface
├── resources/
│   └── activity-bar.svg        # Activity Bar icon
├── package.json
└── tsconfig.json
```

## Building

```bash
npm install
npm run compile
```
