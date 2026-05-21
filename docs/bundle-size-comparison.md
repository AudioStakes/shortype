# Bundle Size Comparison

This document compares the production bundle across four checkpoints in the recent dependency cleanup and Preact migration work.

## Measurement Notes

- Each build was produced with the repository's production build command for that commit.
- `51d5cee` was still on the older Vue/Vite 2 toolchain, so its JS output is split into `vendor` and `index` chunks. The table below uses the combined total for easier comparison.
- For the newer builds, the JS output is a single entry chunk plus the generated CSS bundle.
- Asset images were unchanged across these checkpoints, so the changes below are focused on JS and CSS bundle output.

## Comparison Table

| Commit | State | Build toolchain | JS bundle | JS gzip | CSS bundle | CSS gzip | Transformed modules | Build time |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `51d5cee` | Vue, before the dependency/tooling cleanup | Vite 2.8.6 | `275.55 KiB` combined (`62.44 KiB` + `213.11 KiB`) | `59.00 KiB` combined (`23.25 KiB` + `35.75 KiB`) | `18.57 KiB` | `4.08 KiB` | `542` | not reported in output |
| `c698bce` | Vue, after latest-deps + Biome work | Vite 8 | `265.98 kB` | `62.67 kB` | `21.84 kB` | `5.07 kB` | `109` | `179ms` |
| `c576400` | Preact migration initial state | Vite 8 | `269.17 kB` | `63.48 kB` | `21.84 kB` | `5.07 kB` | `118` | `182ms` |
| `9e59926` | Current head after cleanup and UI refinements | Vite 8 | `210.63 kB` | `40.92 kB` | `22.35 kB` | `5.26 kB` | `87` | `83ms` |

## What Changed

### 1. The real bundle win came after the Preact migration was settled

The initial Preact migration at `c576400` did not immediately shrink the JS bundle relative to `c698bce`.

- JS raw size went from `265.98 kB` to `269.17 kB`
- JS gzip went from `62.67 kB` to `63.48 kB`

That tells us the migration itself was not the final source of savings. The reduction came after the follow-up cleanup work:

- `94dcec3` fixed the dev-server resolution issue
- `94e0b23` patched the Preact preset / `zimmerframe` integration
- `1c21b5b` removed migration leftovers
- `5d9da98` and `9e59926` refined the shortcut UI and compact layouts

By `9e59926`, the bundle had dropped to `210.63 kB` raw and `40.92 kB` gzip.

### 2. The size reduction is mainly in JS, not CSS

Compared with `c698bce`, the current head is:

- `-55.35 kB` raw JS
- `-21.75 kB` JS gzip
- `+0.51 kB` raw CSS
- `+0.19 kB` CSS gzip

So the improvement is overwhelmingly a JS bundle story. CSS grew slightly, but the net result is still a large win.

### 3. Build work got lighter as well

The number of transformed modules dropped from `109` at `c698bce` to `87` at `9e59926`.

Production build time also improved from `179ms` to `83ms`.

That does not prove runtime performance by itself, but it is a strong sign that the build pipeline is doing less work and the dependency graph is smaller.

### 4. Compared with the older Vue/Vite 2 checkpoint, the overall win is even clearer

Against `51d5cee`, the current head is roughly:

- `64.92 KiB` smaller in raw JS
- `18.08 KiB` smaller in JS gzip
- dramatically lower in transformed module count (`542` to `87`)

The older checkpoint is not perfectly apples-to-apples because it used a different Vite major version and different output structure, but it still shows the direction of travel very clearly.

## Bottom Line

The dependency cleanup and library upgrade work prepared the ground, but the biggest bundle-size reduction came from the Preact migration plus the follow-up cleanup that removed migration leftovers and simplified the component tree.

From the most relevant Vue-era checkpoint (`c698bce`) to the current head (`9e59926`), the production JS bundle is down by about `21.8%` raw and `34.7%` gzip.
