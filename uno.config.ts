import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
  shortcuts: {
    'overlay-shell': 'fixed inset-0 z-50 flex items-center justify-center p-4',
    'overlay-backdrop': 'absolute inset-0 bg-black/35',
    'overlay-panel':
      'relative z-10 w-full max-h-[calc(100dvh-2rem)] overflow-y-auto [overscroll-behavior:contain] [scrollbar-gutter:stable]',
    'shadow-3d':
      'shadow-[1px_3px_0_rgb(208_213_219),1px_1px_0_rgb(208_213_219)]',
    'ui-button':
      'inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-gray-700 transition duration-200 hover:bg-gray-200 hover:ease-out',
    'ui-close-button':
      'rounded-lg p-1 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900',
    'ui-card':
      'flex min-h-20 w-10/12 shrink-0 items-center justify-between gap-2 py-2 rounded-lg border border-gray-200 bg-white shadow-md transition duration-200 hover:bg-gray-100 hover:ease-out',
    'ui-keycap-frame':
      'flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white text-center leading-none shadow-3d',
    'ui-keycap-chip':
      'rounded border border-gray-300 bg-white px-2 py-1 shadow-3d',
  },
  preflights: [
    {
      getCSS: () => `
        *,
        ::before,
        ::after {
          box-sizing: border-box;
          border-width: 0;
          border-style: solid;
        }

        html {
          line-height: 1.5;
          -webkit-text-size-adjust: 100%;
        }

        :root {
          color-scheme: light;
        }

        body {
          margin: 0;
          line-height: inherit;
          min-block-size: 100dvh;
          background: rgb(248 250 252);
        }

        :where(h1, h2, h3, h4, h5, h6, p, blockquote, figure, dl, dd, pre) {
          margin: 0;
        }

        :where(h1, h2, h3, h4, h5, h6) {
          font-size: inherit;
          font-weight: inherit;
        }

        :where(ol, ul, menu) {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        a {
          color: inherit;
          text-decoration: inherit;
        }

        :where(code, kbd, samp, pre) {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 1em;
        }

        table {
          border-collapse: collapse;
          border-color: inherit;
          text-indent: 0;
        }

        :where(button, input, select, optgroup, textarea) {
          font: inherit;
          color: inherit;
          letter-spacing: inherit;
          margin: 0;
          padding: 0;
          border-radius: 0;
          background-color: transparent;
        }

        :where(img, svg, video, canvas, audio, iframe, embed, object) {
          display: block;
          vertical-align: middle;
        }

        :where(img, video) {
          max-width: 100%;
          height: auto;
        }

        :where(h1, h2, h3, h4, h5, h6) {
          text-wrap: balance;
        }

        :where(p, li) {
          text-wrap: pretty;
        }

        :where(button, a[href], input, select, textarea, summary):focus-visible {
          outline: 3px solid rgb(37 99 235);
          outline-offset: 3px;
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }

          to {
            opacity: 0;
            transform: translateX(2%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          :where(*, *::before, *::after) {
            animation: none !important;
            scroll-behavior: auto !important;
            transition-duration: 0s !important;
          }
        }
      `,
    },
  ],
})
