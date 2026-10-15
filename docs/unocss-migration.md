# UnoCSS Migration Notes

Shortype now uses UnoCSS instead of Tailwind for utility-style authoring.

## Why we switched

- The app already relies heavily on utility classes, so UnoCSS fits the existing component style.
- UnoCSS generates only the utilities that are actually used, which keeps shipped CSS smaller.
- The Vite setup is simpler because there is no Tailwind-specific plugin to maintain.
- Custom utilities, shortcuts, and motion keyframes now live in `uno.config.ts`, so project-specific styles stay in one place.

## Practical benefits

- Smaller CSS bundle in production builds.
- Less framework-specific configuration to maintain.
- The components kept the same class-driven markup style, so the migration did not require a large template rewrite.

## Notes

- The setup uses `presetWind3()` to preserve existing Tailwind-style utilities, including `space-x-*`, `space-y-*`, `sr-only`, and `object-scale-down`.
- UnoCSS does not include a browser reset by default. The project preflight in `uno.config.ts` resets document spacing, lists, links, controls, media, and tables so browser defaults do not change the layout.
- The removal animation retains its fade and horizontal movement. Reduced-motion preferences disable animation and transitions.
- The migration keeps the existing design language intact while reducing CSS payload and dependency surface.
