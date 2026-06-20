# SiriLV Web IDE

VSCodium-like static browser IDE for GitHub Pages.

Open: `https://sirilv.github.io/web/`

## Scope

This project is a portable file editor that works directly in the browser on desktop and mobile. It intentionally does not run code, open a real shell, commit to GitHub or push to remote repositories. Those features require a backend, OAuth flow or a remote container.

## Features

- VSCodium-style layout: titlebar, activity bar, sidebar, editor tabs, preview panel and statusbar.
- Clean default workspace: only `README.md` with usage instructions.
- Create files and folders.
- Rename, delete, duplicate and download files.
- Multiple editor tabs.
- Line numbers, Tab insertion and cursor status.
- Workspace search by filename and file content.
- Markdown, HTML, JSON, SVG/text preview.
- Import local text files.
- Export full workspace as JSON.
- Autosave.
- Session restore through browser `localStorage` plus cookie metadata and small-workspace cookie backup.
- Interface settings: theme, accent color, font size, line height, tab size, explorer width, word wrap, compact UI and autosave.
- Responsive mobile sidebar.

## Shortcuts

- `Ctrl/Cmd + S` — save workspace.
- `Ctrl/Cmd + N` — create file.
- `Ctrl/Cmd + Shift + P` — command palette.
- `Ctrl/Cmd + F` — search.
- `Ctrl/Cmd + B` — toggle sidebar.
- `Ctrl/Cmd + W` — close current tab.
- `Escape` — close overlays.

## Storage

Full files are stored in `localStorage` because cookies are too small for a real workspace. Cookies store session metadata, settings and a small-workspace fallback when the workspace is tiny enough to fit safely.
