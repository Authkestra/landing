## What this repo is

This is a standalone Astro site — the landing page for Authkestra, deployed at
`authkestra.com`. It used to be the `landing/` directory inside the `marcjazz/authkestra`
monorepo and was split out with its git history intact; it is no longer part of that workspace and
has no `crates/` next to it. If you need to check a documented API against the real source, that
lives in the `marcjazz/authkestra` repo, not here.

## Design tokens are a copy, not a source

`src/styles/tokens.css` is copied verbatim from the canonical `authkestra/design/tokens.css`.
Never edit colours, spacing, or type values in this repo directly — change the canonical file in
`marcjazz/authkestra` and re-copy it here unchanged. Follow all design system rules in
`authkestra/design/DESIGN.md` (neutral ground, at most one rust accent per region, Lucide 1.5 stroke
icons, and warm code-highlighting lightness steps).

## Commands

| Command | Action |
| :--- | :--- |
| `pnpm install` | Installs dependencies |
| `pnpm dev` | Starts local dev server at `localhost:4321` |
| `pnpm build` | Builds the production site to `./dist/` |
| `pnpm preview` | Previews the build locally before deploying |
