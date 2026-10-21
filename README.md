<p align="center">
  <img style="height: 20rem;" src="https://user-images.githubusercontent.com/15713392/161007516-353e752d-dace-4b67-9ef9-afbbce0572ea.gif" alt="animated" />
</p>

# Shortype

Shortcut key training app built with Preact + Vite + UnoCSS.

## URL

https://shortype.vercel.app/

## Features

- Just type the shortcut key to train
- All shortcut keys from the official documentation are available
- Automatically increases the frequency of unmastered shortcut keys
- Focus on the shortcut keys you want to master by excluding non-interesting shortcut keys
- Styling is generated on demand with UnoCSS, so the shipped CSS stays smaller and the utility workflow stays simple

## Styling Notes

For the migration summary and the practical benefits of the UnoCSS switch, see [docs/unocss-migration.md](docs/unocss-migration.md).

## Available apps for training

- Google Chrome
- Terminal (macOS)
- macOS

## Usage

### Install dependencies

```bash
npm install
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

### Build for production

```bash
npm run build
```

Production builds target the site root used by Vercel and are emitted to `dist/`.

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
