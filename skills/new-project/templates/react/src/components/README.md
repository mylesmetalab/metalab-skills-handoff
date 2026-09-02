# Component convention

One folder per component: `components/<PascalCaseName>/`. Each folder holds:

- `<Name>.tsx` — the component. Variant props built with `class-variance-authority` (`cva`); every class comes from `<Name>.module.css`, styled only from `tokens.css` custom properties. No hardcoded color, spacing, or radius.
- `<Name>.module.css` — CSS Modules. Zero build config needed beyond what Vite already provides.

## Naming

- Component export name in PascalCase, matching the folder (`components/Button/Button.tsx` exports `Button`).
- Figma variant axes become `cva` variant keys: `Type=Primary` → `variant: "primary"`. Boolean Figma props become boolean component props.
- The Figma "State" axis (Default/Hover/Disabled) is **never** a prop — it maps to `:hover` and the native `disabled`/`aria-disabled` attribute directly in the CSS Module. If a `state` prop shows up, that's a bug, not a variant.

## Accessible, interactive components

For anything with real behavior a plain element can't express on its own — a select/combobox, a dialog, a tooltip, a menu — reach for the matching primitive from **Base UI** (`@base-ui-components/react`, already a dependency) rather than hand-rolling focus management, keyboard handling, or ARIA wiring. Base UI ships unstyled — style it the same way as everything else, through `tokens.css` custom properties, not its own defaults.

## See it working

`components/Button/` follows this convention end to end — copy its shape for the next component.
