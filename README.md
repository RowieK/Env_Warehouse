# .env Warehouse

A Visual Studio Code extension to securely store and manage reusable `.env` variables in a sidebar.

## Features

- **Sidebar view** – Activity Bar icon opens a clean tree view of all stored variables.
- **Add / Edit / Delete** – Manage variables with name, value, optional description, and optional category/tag.
- **Inject to .env** – Click the `→` button on any variable to instantly add it to the `.env` file in your workspace root. The file is created if it doesn't exist.
- **Duplicate protection** – Variables already present in `.env` (by name) are never duplicated.
- **Export all** – Export every stored variable to `.env` in one click.
- **Persistent storage** – Variables are saved with VSCode's `globalState` and survive restarts.

## Variable Name Rules

Names must match `^[A-Z_][A-Z0-9_]*$` — uppercase letters, numbers, and underscores only (e.g. `API_KEY`, `DB_HOST`).

## Use Guide

- **Creating variable** - By pressing the `+` sign in the `.ENV Warehouse` a pop-up on top of the screen appears - this is the `Variable Name`. When naming the variable press `Enter`.
- **Inserting value** - After you've done the previous step, the `Value` of the variable must be given.
- **Optional Description** - This is a note to remind the user what the variable is.
- **Optional Category/Tag** - This is handy when multiple variables across multiple projects are stored. This can be used to identify the project the variable is used in.
- **Export All to .env** - Export all .env variables from the warehouse to a .env file.
- **Search Bar** - In the menu of the variables a search icon will be present. Env variables are searched based of name, description and category/tag for easy access of .env variables.
```
Variable ──> Value ──> Description ──> Category/Tag ──> Enter to save
```