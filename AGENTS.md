# AGENTS

## Working Norms

- Run the smallest relevant `lint`, `test`, and `format` checks during implementation, not only at the end.
- Re-run checks after meaningful edits, especially in shared logic, types, session state, storage, or formatting-sensitive files.
- Prefer focused checks first; use the full suite when it is needed to validate the change scope.
- If a check fails, fix it immediately and rerun the same check before moving on.
- Before handing off or pushing, run the full relevant validation set for the change.

## Repo Context

- Use `npm run check` for repo sanity, `npm test` for behavior, and `npm run build` when production output or type boundaries may change.
- The codebase currently uses `tool` in the UI and stores, while `app` appears in some data and model fields. Treat terminology changes as deliberate, repo-wide edits.
- When changing session, store, storage, or `data/` logic, update the related tests in the same pass.
- For shared session state or shortcut generation, run the narrowest related test first, then the full suite if needed.
