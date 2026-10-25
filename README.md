<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/mark-on-dark.svg">
  <img src=".github/assets/mark-on-light.svg" alt="Authkestra" width="56" height="56">
</picture>

# Authkestra landing page

The source for <https://authkestra.com>, built with [Astro](https://astro.build).

This repo used to live at `landing/` inside the `marcjazz/authkestra` monorepo. It was split out
with `git subtree split` so the landing page could deploy on its own repository without dragging the
Rust workspace along — the commit history above this point is the real history of that directory.

## Project Structure

```
.
├── public/                     # CNAME, favicons, icons
├── src/
│   ├── components/             # Static Astro sections (Hero, FlowAnimation, WhyAuthkestra, etc.)
│   ├── icons/                  # Inline Lucide SVG paths (stroke 1.5)
│   ├── layouts/                # Base HTML layout
│   ├── lib/                    # Build-time Rust syntax highlighter
│   ├── pages/                  # index.astro
│   └── styles/
│       ├── tokens.css          # Verbatim copy of canonical authkestra/design/tokens.css
│       └── global.css          # Base reset and typography rules
├── astro.config.mjs            # Site config + legacy docs.authkestra.com redirects
├── package.json
└── tsconfig.json
```

## Design tokens

`src/styles/tokens.css` is a **verbatim copy** of the canonical `authkestra/design/tokens.css` — the
same file the docs site and the playground copy. Do not edit it here: edit the canonical file in the
`marcjazz/authkestra` repo, then re-copy it into this file unchanged.

## Commands

| Command | Action |
| :-- | :-- |
| `pnpm install` | Installs dependencies |
| `pnpm dev` | Starts local dev server at `localhost:4321` |
| `pnpm build` | Build the production site to `./dist/` |
| `pnpm preview` | Preview the build locally, before deploying |

## Licence

MIT OR Apache-2.0, matching the framework.
