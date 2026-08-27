# Component convention

One folder per component: `components/<name>/`. Each folder holds:

- `<name>.css` — every value references a token from `tokens.css`. No hardcoded color, spacing, or radius.
- `<name>.example.html` — a snippet showing real markup and every variant/state, for copy-paste and for visual reference. Not shipped to production pages.

## Naming

- Component root class: `.btn`, `.card`, `.badge` — lowercase, matches the folder name.
- Figma variant axes become BEM-style modifier classes: `Type=Primary` → `.btn--primary`, `Size=Small` → `.btn--sm`.
- The Figma "State" axis (Default/Hover/Disabled) is **never** a modifier class — it maps to `:hover` and `:disabled`/`[disabled]`/`[aria-disabled]` directly in the CSS. If a class like `.btn--hover` shows up, that's a bug, not a variant.

## See it working

`components/button/` follows this convention end to end — copy its shape for the next component.
