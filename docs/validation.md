# Validation

Use the Node version in `.nvmrc` and npm version in `package.json`. Install dependencies with `npm ci`, install actionlint 1.7.12 using its [official instructions](https://github.com/rhysd/actionlint/blob/v1.7.12/docs/install.md), and install Chromium with `npm exec -- playwright install chromium`.

Run `npm run validate` before handing off or pushing. npm runs each tool directly and stops on its nonzero exit code. Every pull request runs the same checks in separate CI jobs, including both shuffled test orders, browser tests, mutation analysis, and the online audit.

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

Stryker performs a fresh full run with a native overall mutation threshold of 90% and rejects runs with no tests. Its process must succeed within the CI job's 30-minute limit. Mutation status details and per-file scores remain available in the native report.

The repository does not reparse reports, inspect tool implementations, compare effective configurations with the base branch, or maintain a custom file inventory. It also does not independently enforce skipped-test totals, nonzero mutant counts, per-file mutation scores, or zero `NoCoverage`/compile-error counts. Those additional custom guarantees were removed; native tool configuration and independent code review define the supported checks.

## Dependency patch

`patches/unconfig+7.5.0.patch` repairs one upstream type declaration so TypeScript can keep `skipLibCheck: false`. The standard `git apply` command applies it during installation, accepting an already applied patch; Git must be installed, and installation fails if application fails. Remove the patch when a compatible upstream release fixes the declaration. TypeScript checks the installed declarations directly; no separate patch validator or validator tests are maintained.

## CI and deployment

CI uses the pinned Node/npm versions, action commits, and official actionlint installer. The always-running `lint_and_test` job fails unless every required job succeeds. Main requires this GitHub Actions check and an up-to-date PR, including for administrators. Forced pushes and deletion are prohibited; separate GitHub account approvals are not required.

Reports live in `coverage/`, `reports/`, and `test-results/`; CI retains diagnostics for seven days. Configuration changes receive independent review, and existing native checks verify the result. Add tests for application behavior rather than recreating tests for the tools.

Vercel uses Node `24.x` and the declared npm version through `vercel.json`. After Preview is ready, run `PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e` to exercise the same suite against it. See Vercel's [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) and [package managers](https://vercel.com/docs/package-managers) documentation.

Chromium automation does not establish physical-keyboard, OS-reserved-key, IME, or VoiceOver compatibility; check these manually when affected.
