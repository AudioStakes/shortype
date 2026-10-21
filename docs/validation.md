# Validation

Use the exact Node version in `.nvmrc` and npm version in `package.json` for local development and CI. Install from the committed lockfile with `npm ci`, then install Chromium with `npm exec -- playwright install chromium`.

Run `npm run validate` before handing off or pushing. It runs the gates listed in `quality-policy.json`, including coverage, both fixed shuffled test orders, production browser checks, mutation analysis, workflow validation, and the online dependency audit. Network and tool failures fail validation. Focused checks are useful during implementation; they do not replace the full gate.

## Ownership

| Tool | Responsibility |
| --- | --- |
| Biome | Formatting, imports, syntax, JSX, accessibility, and Preact Hooks |
| TypeScript | Browser, Node/configuration, unit-test, and E2E projects, including JavaScript |
| ESLint | Type-aware unsafe operations, Promise handling, and disabled/focused Vitest tests |
| Knip | Unused files, exports, and dependencies, including tests and development dependencies |
| Vitest | Behavior, assertion requirements, isolation, shuffled execution, and V8 coverage |
| Playwright and axe | Chromium production-build behavior, keyboard navigation, accessibility, and narrow layouts |
| Stryker | Detection strength across all ten critical modules |
| actionlint and npm audit | Workflow correctness and vulnerabilities, including development dependencies |

Biome is the single formatter. ESLint intentionally has no formatting or general syntax preset. The four TypeScript projects keep browser ambient types separate from Node and Vitest globals. The inventory guard compares Git's tracked and untracked files against project roots, so a new JavaScript or TypeScript file cannot silently escape type checking.

The installed `unconfig` declaration repair verifies both the package version and exact original or repaired line. Unexpected contents fail installation. Remove the repair after an upstream declaration fix and validate the full dependency graph with library checking enabled.

## Test requirements

`quality-policy.json` is the authoritative source for coverage and mutation floors and target modules. Coverage includes unimported executable files in `src/`, `data/`, and `scripts/`. Tests must verify observable behavior and boundary conditions; generation tests capture output without rewriting checked-in JSON. Storage and status property tests use fixed seeds and 500 cases each.

Vitest requires assertions, forbids focused tests, retries zero times, and fails on empty runs and unhandled errors. Its result guard also rejects skipped, todo, pending, or unexecuted tests. Both shuffled seeds run on every PR. Stryker performs a fresh full run; its result guard rejects empty results, runtime/compile errors, uncovered mutants, and scores below the global or per-file floor.

Production browser tests exercise real key events, persistence and reload, modal focus and input suspension, storage failures, exclusion recovery, WCAG A/AA checks, and 320px layouts. Passing Chromium automation does not establish physical-keyboard, OS-reserved-key, IME, or VoiceOver compatibility; those need manual checks when affected.

## Failures and review

Fix the first relevant failure and rerun that check. Run tools separately when one failure would hide another tool's diagnostics. For validation changes, demonstrate an invalid fixture failing and its corrected counterpart passing. Obtain an independent review for rule conflicts and coverage gaps, and another review for meaningful assertions and concealed bugs. Repeat corrections and checks until required findings are resolved.

Reports are written to `coverage/`, `reports/`, and `test-results/`. CI preserves coverage, mutation reports, browser traces, and failure screenshots for seven days. Mutation has its own 30-minute job limit; a timeout is a failure. The always-running `lint_and_test` aggregate succeeds only when every required job reports success.

Threshold reductions and removal of protected validation targets are checked against the PR base. Changes to validation must retain effective source coverage and executable gates, rather than merely preserving the policy JSON.

Main accepts changes through an up-to-date PR after the GitHub Actions `lint_and_test` check succeeds. No separate GitHub account approval is required; independent agent review is still required. Administrators follow the same branch restrictions.

## Vercel

Vercel selects Node by major version, so `engines.node` remains `24.x`; local and CI validation enforce the exact `.nvmrc` version. `vercel.json` explicitly installs the declared npm version before `npm ci` and logs the build runtime. Verify the Preview build and app before merging. See Vercel's [Node version](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) and [package manager](https://vercel.com/docs/package-managers) documentation.

Run the same browser suite against a ready Preview with `PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e`. The external URL selects its storage origin and skips the local build server. Use a Preview that the browser can access; deployment authentication is separate from the app's behavior.
