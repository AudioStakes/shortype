# UnoCSS Migration Notes

Shortype now uses UnoCSS instead of Tailwind for utility-style authoring.

## Why we switched

- The app already relies heavily on utility classes, so UnoCSS fits the existing component style.
- UnoCSS generates only the utilities that are actually used, which keeps shipped CSS smaller.
- The Vite setup is simpler because there is no Tailwind-specific plugin to maintain.
- Custom utilities such as the `shadow-3d` helpers and motion keyframes still live in `src/index.css`, so project-specific styles remain easy to find.

## Practical benefits

- Smaller CSS bundle in production builds.
- Less framework-specific configuration to maintain.
- The components kept the same class-driven markup style, so the migration did not require a large template rewrite.

## Notes

- The current setup uses `presetWind3`, so the utility syntax stays close to the Tailwind-style classes already used in the codebase.
- The migration keeps the existing design language intact while reducing CSS payload and dependency surface.
