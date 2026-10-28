<p align="center">
  <img style="height: 20rem;" src="https://user-images.githubusercontent.com/15713392/161007516-353e752d-dace-4b67-9ef9-afbbce0572ea.gif" alt="animated" />
</p>

# Shortype

Shortcut key training app built with Preact + Vite + UnoCSS.

## URL

https://shortype.vercel.app/

## Features

- Just type the shortcut key to train
- Practice shortcuts selected from the official Chrome, Terminal, and macOS documentation
- Automatically increases the frequency of unmastered shortcut keys
- Focus on the shortcut keys you want to master by excluding non-interesting shortcut keys
- Styling is generated on demand with UnoCSS, so the shipped CSS stays smaller and the utility workflow stays simple

## Styling Notes

For the migration summary and the practical benefits of the UnoCSS switch, see [docs/unocss-migration.md](docs/unocss-migration.md).

## Available apps for training

- Google Chrome
- Terminal (macOS)
- macOS

The catalog was reviewed on 2026-10-22 against the official [Chrome](https://support.google.com/chrome/answer/157179?hl=ja), [Terminal](https://support.apple.com/ja-jp/guide/terminal/trmlshtcts/mac), and [macOS](https://support.apple.com/ja-jp/102650) references. It contains 350 questions and retains hardware and OS version conditions in their descriptions. Questions with only Fn alternatives use self-scoring.

## Saved progress

Answers and excluded questions synchronize between tabs. Browsers with Web Locks serialize simultaneous progress updates; browsers without it still save progress, but simultaneous writes are best effort. Reload all open Shortype tabs after an update so they use the same saving behavior.

The latest two answers per question are retained for progress and practice frequency.

If reading or saving progress fails, training continues in memory for the rest of that page session. Further progress is not saved until the page is reloaded, and closing or reloading the page loses unsaved progress.

Incompatible saved schemas are reset before current-format data is saved. Renamed macOS settings categories are migrated when loading existing selections.

## Keyboard behavior

Browser-reserved combinations require fullscreen and a successful Keyboard Lock request for automatic scoring. Unrestricted alternatives remain usable. When no alternative can be scored automatically, press C to reveal the answer and use Y/N to self-score.

Supported browsers refresh the keyboard layout when the window regains focus or the page becomes visible. After changing the OS input source while staying on the page, switch away and back to request a refresh. Physical keyboards, OS-reserved keys, IME, and VoiceOver still require manual verification.

## Usage

### Install dependencies

```bash
nvm install
nvm use
npm install --global npm@11.19.1
npm ci
```

### Run development server

```bash
npm run dev
```

### Typecheck and lint

```bash
npm run check
```

### Run tests

```bash
npm test
```

### Run all required validation

Install actionlint 1.7.12 using its [official installation instructions](https://github.com/rhysd/actionlint/blob/v1.7.12/docs/install.md), then run:

```bash
npm exec -- playwright install chromium
npm run validate
```

Run these gates locally before handing off changes. Automatic GitHub Actions runs are disabled; opening or updating a pull request does not start CI. See [the validation guide](docs/validation.md) for tool ownership, failure reports, coverage and mutation requirements, and the review process.

### Build for production

```bash
npm run build
```

Production builds target the site root used by Vercel and are emitted to `dist/`.

The only application URL is `/`; About and Privacy open as dialogs. Unknown
pages, API paths, and assets return HTTP 404 without loading the application.
Vite's development and preview servers disable SPA fallback with `appType: 'mpa'`.
The build emits a standalone, JavaScript-free `404.html`, which Vercel serves for
missing files using its [static 404 handling](https://vercel.com/kb/guide/custom-404-page).
Vite returns its default 404 response for missing files locally; open `/404.html`
to preview the custom page. After deployment, verify unknown URLs with both GET
and HEAD, or run the E2E suite with `PLAYWRIGHT_BASE_URL` set to the Preview URL.

## Privacy and analytics

The footer's 「プライバシー」 dialog explains browser-local training data and
Cloudflare Web Analytics. Answer history, excluded shortcut IDs, and selected
tool/category preferences stay in localStorage; neither these records nor typed
shortcut keys are sent to analytics.

The manual Cloudflare beacon in `src/utils/web-analytics.ts` loads once after page
load, only on `https://shortype.vercel.app`. Local development, Vercel previews,
and alternate hosts do not send analytics. The site token is a public identifier,
not an API credential. Avoid adding a second beacon through hosting settings.

Cloudflare collects aggregate usage and performance data without analytics
cookies or browser storage. See its [RUM data and privacy documentation](https://developers.cloudflare.com/speed/observatory/rum-beacon/).

## GitHub Pages

Override Vite's base path when publishing under the repository path:

```bash
npm run build -- --base=/shortype/
```

For branch-based GitHub Pages without Actions, copy the contents of `dist/` into `docs/` or publish `dist/` to a `gh-pages` branch.
