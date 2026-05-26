# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

This is a partial React fitness app built with Vite. The app currently uses:

- React 19 with JSX
- Vite for local development and builds
- Tailwind CSS 4 through `@tailwindcss/vite`
- ESLint for linting

The main app entry points are:

- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- Feature components in `src/Components/`

## Commands

Use npm scripts from `package.json`:

```sh
npm run dev
npm run build
npm run lint
npm run preview
```

Run `npm run lint` after code changes when possible. Run `npm run build` before handing off broader UI or routing changes.

## Working Notes

- This repository is still in an early/partial state. Do not assume all imported state, props, or components are already wired correctly.
- Keep changes small and focused. Prefer improving the current app structure over introducing a new framework or large architectural pattern.
- Preserve Vite conventions unless there is a clear reason to change them.
- Components should remain functional React components using hooks where needed.
- Keep styling consistent with the existing Tailwind utility approach.
- Use `src/Components/` for existing feature components unless the project is intentionally migrated to a different casing. Be careful on case-sensitive filesystems.
- Do not commit generated output such as `dist/`, caches, logs, or dependency folders.

## UI Guidance

- Build the actual app experience, not a landing page, unless explicitly requested.
- Fitness and nutrition workflows should be easy to scan and update.
- Keep controls concrete and usable: forms for user data, clear buttons for actions, and responsive layouts for mobile and desktop.
- Avoid large unrelated redesigns when the request is for a targeted fix.

## File And Dependency Hygiene

- Do not edit files under `node_modules/`.
- Do not hand-edit `package-lock.json` except as the result of npm commands.
- If adding dependencies, prefer small, well-maintained packages and document why they are needed.
- Keep secrets and local environment files out of the repository.

## Verification Checklist

Before finishing a code change, consider:

- Does `npm run lint` pass?
- Does `npm run build` pass?
- Does the app load in Vite without console-breaking runtime errors?
- Do imports match the actual file and folder casing?
- Are generated files, dependency folders, and local-only files excluded?
