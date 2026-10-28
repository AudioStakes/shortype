# Validation

Use the Node version in `.nvmrc` and npm version in `package.json`. Install dependencies with `npm ci`, install actionlint 1.7.12 using its [official instructions](https://github.com/rhysd/actionlint/blob/v1.7.12/docs/install.md), and install Chromium with `npm exec -- playwright install chromium`.

Run `npm run validate` locally before handing off or pushing. npm runs each tool directly and stops on its nonzero exit code. The suite includes both shuffled test orders, browser tests, mutation analysis, and the online audit. Automatic GitHub Actions runs are disabled at the user's request; opening or updating a pull request does not start CI.

## Tool ownership

| Tool | Responsibility |
| --- | --- |
| Biome | Formatting, imports, syntax, JSX, accessibility, and Preact Hooks |
| TypeScript | Browser, Node/configuration, unit-test, and E2E projects, including JavaScript |
| ESLint and its official Vitest plugin | Type-aware unsafe operations, Promise handling, disabled/focused/todo tests, and conditionally declared tests |
| Knip | Unused files, exports, and dependencies across application and test code |
| Vitest | Assertions, isolation, test execution, shuffled order, and V8 coverage |
| Playwright and axe | Production browser behavior, keyboard navigation, accessibility, and narrow layouts |
| Stryker | Mutation testing of the ten configured critical modules |
| actionlint and npm audit | Workflow correctness and vulnerabilities, including development dependencies |
| Git | Applying the dependency declaration patch during installation |

Biome is the single formatter. ESLint has only type-aware rules and the official Vitest selection rules. The conditional-test rule checks conditional declarations; it does not prohibit all `skipIf`/`runIf` APIs. The four TypeScript projects retain strict options and keep browser types separate from Node and Vitest globals. Their recursive include patterns cover the source, data, configuration, unit-test, and E2E directories.

## Native test settings

Vitest requires assertions, rejects focused and empty test runs, fails on unhandled errors, and retries zero times. Native V8 thresholds apply to every executable application/data file: lines, statements, and functions at least 95%; branches at least 90%. The six critical modules additionally require functions 100% and branches 95%. Type declarations and generated JSON are excluded. Unimported application files remain included.

Application tests verify behavior and boundaries. Storage and status property tests use fixed seeds and 500 cases each. Data-generation tests capture writes without changing checked-in JSON. Production browser tests cover key events, persistence and reload, modal focus and input suspension, storage failures, exclusion recovery, WCAG A/AA, and 320px layouts.

Stryker performs a fresh full run with a native overall mutation threshold of 90% and rejects runs with no tests. Its process must succeed. The retained manual workflow has a 30-minute mutation job limit. Mutation status details and per-file scores remain available in the native report.

The repository does not reparse reports, inspect tool implementations, compare effective configurations with the base branch, or maintain a custom file inventory. It also does not independently enforce skipped-test totals, nonzero mutant counts, per-file mutation scores, or zero `NoCoverage`/compile-error counts. Those additional custom guarantees were removed; native tool configuration and independent code review define the supported checks.

## Dependency patches

`patches/unconfig+7.5.0.patch` repairs one upstream type declaration so TypeScript can keep `skipLibCheck: false`. The standard `git apply` command applies it during installation, accepting an already applied patch; Git must be installed, and installation fails if application fails. Remove the patch when a compatible upstream release fixes the declaration. TypeScript checks the installed declarations directly; no separate patch validator or validator tests are maintained.

`patches/happy-dom+21.0.4.patch` keeps the security-fixed test dependency compatible with Node 24's types. Its generated `ReadableStream` declaration refers to `UnderlyingDefaultSource`, which Node 24 does not export. The patch uses the imported constructor type directly, matching the upstream source, without changing runtime behavior or weakening TypeScript checks. It uses the same installation mechanism; remove it when an upstream declaration fix supports Node 24.

## CI and deployment

The GitHub Actions workflow is disabled in repository settings, and its definition accepts only manual `workflow_dispatch` events. Do not enable it or restore automatic PR/push triggers or required CI checks without explicit user authorization. Local validation and independent Codex subagent review remain required. Do not request Copilot reviews as part of this process.

Main still requires a PR, including for administrators. Forced pushes and deletion are prohibited; separate GitHub account approvals and CI status checks are not required.

The retained manual workflow uses pinned Node/npm versions, action commits, and the official actionlint installer. Its `lint_and_test` job fails unless every validation job succeeds. Reports live in `coverage/`, `reports/`, and `test-results/`; an explicitly enabled manual run retains diagnostics for seven days. Configuration changes receive independent review, and existing native checks verify the result. Add tests for application behavior rather than recreating tests for the tools.

Vercel uses Node `24.x` and the declared npm version through `vercel.json`. After Preview is ready, run `PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e` to exercise the same suite against it. See Vercel's [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) and [package managers](https://vercel.com/docs/package-managers) documentation.

Chromium automation does not establish physical-keyboard, OS-reserved-key, IME, or VoiceOver compatibility; check these manually when affected.
