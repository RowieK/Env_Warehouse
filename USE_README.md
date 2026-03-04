# Env House — User Guide

This short guide shows how to use the Env House extension from a user's perspective. It assumes you have the extension installed and activated in Visual Studio Code.

## What Env House does

.Env Warehouse is a powerful Visual Studio Code extension designed to help you manage your .env variables in a structured and efficient way. Instead of repeatedly recreating environment variables across projects, you can store, organize, and reuse them from a centralized workspace sidebar.

All variables are securely persisted within the extension, meaning they remain available even after closing VSCode or switching between projects. This gives you a consistent, organized overview of your frequently used environment variables and enables fast, error-free implementation in any project.

The extension also supports named environment sets (such as local, staging, and prod), allowing you to maintain separate key–value configurations for different deployment stages. With a single action, you can import selected variables directly into a .env file or export entire sets when needed, making environment management clean, scalable, and developer-friendly.

## Where to find it

- Open the Explorer side bar in VS Code.
- Find the `Env Warehouse` tree view (a custom provider). It lists environment sets as top-level nodes.

## Buttons & Actions (UI reference)

Below are the actions and buttons you'll see in the Env House view and what each one does.

Where to click / how to trigger:
- Use the `Env Warehouse` tree in the Explorer sidebar and right-click sets or variables for the context menu.
- Or run the corresponding command from the Command Palette.

Recommended workflow (typical user flow):
1. Create a set with `Create a folder` named for your environment.
2. Select the folder and use `Add Variable` to add required key/value pairs.
3. During development either:
    - Place the editor cursor and use `Insert Value` to paste directly into the file.
4. Update values with `Edit Variable` when things change.
5. Remove unused variables or sets with `Remove Variable` or `Delete Environment Set`.

Safety notes and UX tips:
- If `Delete Environment Set` is destructive, expect a confirmation prompt.

## Using values in tasks or debug configurations

Env House does not currently inject values automatically into `tasks.json` or `launch.json`. To use values there:

1. Copy the variable value with `Copy Value`.
2. Open `tasks.json` or `launch.json` and paste the value into the appropriate field.

Tip: You can maintain templates in your workspace and paste values when configuring tasks or launch configurations.

## Practical examples

- Insert API keys or endpoints into configuration files while developing.
- Keep different sets for branches or services (e.g., `backend-local`, `frontend-local`).
- Use `Search Variable`,Search the variable, press enter, `Copy Value` to paste secret tokens into temporary terminal sessions (be cautious: clipboard can be read by other apps).
- Stores .env variables for easy use on different projects.
- Creating an overview of .env variables.

## Safety & best practices

- Do not store highly sensitive secrets (production private keys, permanent tokens) unless you are certain your machine's storage is secure.
- Regularly review and remove secrets you no longer use.

## Troubleshooting (user-level)

- I don't see the Env House view: run any `Env Warehouse` command from the Command Palette to activate the extension.
- Copy/insert not working: ensure the extension is active and reload the window (Developer: Reload Window).
- Values not persisted after restart: check that VS Code is not preventing extensions from saving global state, or check the Developer Tools console for errors.

## Short reference of buttons

- `Add Folder` — creates a folder where variables can be stored.
- `Add Variable` — add a key/value to a set.
- `Edit Variable` — change key or value.
- `Search Variable` — searches for variables based of names, description and category/tag.
- `Remove Variable` — delete a variable.
- `Delete Folder` — deletes folder.
- `Inject to .env` — insert value into active editor.
- `Import .env File` — import an .env file into the extension.
- `Import .env File to Folder` — imports all existing variables inside the .env file into the extension. When the button is pressed in the folder selection, the variables are stored inside of the group.
- `Export All to .env` and `Inject Folder to .env` exports the variables in the existing .env file, when no file is within the project, a .env file will be created with the variables you wanted to export.

## Want more?

Feel free to leave some suggestions!