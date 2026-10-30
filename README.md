<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/mark-on-dark.svg">
  <img src=".github/assets/mark-on-light.svg" alt="Authkestra" width="56" height="56">
</picture>

# Authkestra Landing Page (`authkestra.com`)

[![Site Status](https://img.shields.io/website?url=https%3A%2F%2Fauthkestra.com&label=authkestra.com&logo=astro&color=f4845f)](https://authkestra.com)
[![Documentation](https://img.shields.io/badge/docs-docs.authkestra.com-e85d2f)](https://docs.authkestra.com)
[![crates.io](https://img.shields.io/crates/v/authkestra.svg?color=ce422b)](https://crates.io/crates/authkestra)
[![License](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue.svg)](https://github.com/Authkestra/authkestra)
[![Skills](https://img.shields.io/badge/agent%20skills-Authkestra%2Fskills-informational)](https://github.com/Authkestra/skills)

The official source code for **[authkestra.com](https://authkestra.com)** -  the marketing and technical showcase for **Authkestra**, the compile-time safe identity and AI agent authorization engine for Rust.

Built with [Astro](https://astro.build) for zero-JS static HTML delivery, sub-second TTFB, and strict compliance with the **"Warm Obsidian & Signal Amber"** design system.

---

## 🌟 Key Highlights

- **High-Conversion Information Architecture**: Positions Authkestra across both backend Rust enterprise infrastructure (OAuth 2.1 Provider, Client, Resource Server, Passkeys, Cedar Policy) and AI/MCP security (`authkestra-mcp` delegated tool authorization, cryptographic HITL step-up approval, zero-trust downstream vault).
- **Interactive 3-Tab Quickstart**: Accessible, tabbed showcase featuring Stateless OAuth2, Passkeys with Re-Proof Gating, and MCP Server Agent Guard, styled with token-driven syntax highlighting (`src/lib/rust-highlight.ts`).
- **Comprehensive Technical SEO & Social Cards**:
 - Full OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`) and Twitter Cards (`summary_large_image`).
 - Native 1200x630 preview card assets (`public/og-card.png`, `public/og-card.svg`).
 - Rich JSON-LD structured data (`@graph` containing `SoftwareSourceCode`, `Organization`, `WebSite`, and `FAQPage`).
 - Programmatic zero-dependency `dist/sitemap.xml` and crawler directives in `public/robots.txt`.
- **AI & LLM Discoverability**: First-class support for AI coding assistants via `https://authkestra.com/llms.txt` and `https://docs.authkestra.com/llms-full.txt`.
- **20+ Backward-Compatible Redirects**: Retains all legacy Starlight documentation routes with `<meta http-equiv="refresh">` pointing to `https://docs.authkestra.com/`.

---

## 📁 Repository Structure

```
.
├── public/                     # CNAME, favicons, robots.txt, og-card preview assets, security.txt, humans.txt
├── scripts/
│   └── verify-landing.mjs      # Automated 20-check SEO, JSON-LD, heading hierarchy, and acceptance verifier
├── src/
│   ├── components/
│   │   ├── AiMcpSecurity.astro # 3-tier MCP security, JCS parameter binding, zero-trust token vault
│   │   ├── AuthMethods.astro   # 11 client auth methods + 5 enterprise server roles
│   │   ├── Comparison.astro    # Expanded comparison matrix (vs oauth2-passkey, Rauthy/Kanidm, sidecars)
│   │   ├── Faq.astro           # 7 technical FAQ Q&As matching JSON-LD FAQPage schema
│   │   ├── FlowAnimation.astro # Visual identity flow demonstration
│   │   ├── Footer.astro        # Non-skipping heading hierarchy footer with ecosystem navigation
│   │   ├── Hero.astro          # H1 headline, lead, CTAs, cargo add snippet with copy button, 6 trust badges
│   │   ├── Icon.astro          # Inlined Lucide SVG stroke component
│   │   ├── Nav.astro           # Sticky navigation with anchor links and GitHub link
│   │   └── WhyAuthkestra.astro # 6 feature cards (Typestate, Stateless OAuth, MCP, Tri-role, Cedar, Agnostic)
│   ├── icons/
│   │   └── paths.ts            # Raw Lucide SVG paths (stroke 1.5, zero runtime bundle overhead)
│   ├── layouts/
│   │   └── Layout.astro        # Base HTML layout, SEO meta tags, OpenGraph, JSON-LD @graph
│   ├── lib/
│   │   └── rust-highlight.ts   # Design-token-mapped Rust syntax highlighter
│   ├── pages/
│   │   ├── index.astro         # Main landing page assembling all components
│   │   ├── llms.txt.ts         # Machine-readable API summary endpoint (/llms.txt)
│   │   └── sitemap.xml.ts      # Native zero-dependency XML sitemap generator (/sitemap.xml)
│   └── styles/
│       ├── global.css          # Utility classes (.visually-hidden, .tabular, typography reset)
│       └── tokens.css          # IMMUTABLE design tokens (Warm Obsidian & Signal Amber)
├── astro.config.mjs            # Site config + 20 legacy docs.authkestra.com redirects
├── package.json
└── tsconfig.json
```

---

## 🎨 Design Tokens & Immutability Invariant

`src/styles/tokens.css` is an **immutable verbatim copy** of `authkestra/design/tokens.css` defining the "Warm Obsidian & Signal Amber" design system:

- Background: `--ak-neutral-950` (`#09090b`)
- Surface Cards: `--ak-neutral-900` (`#18181b`)
- Borders: `--ak-neutral-800` (`#27272a`)
- Brand / Accent: `--ak-rust-700` (`#b7410e`), `--ak-rust-500` (`#e85d2f`), `--ak-rust-400` (`#f4845f`)
- Syntax Highlighting: `--code-keyword`, `--code-type`, `--code-literal`, `--code-fn`, `--code-comment`

> **Critical Rule**: Never modify `src/styles/tokens.css` directly. All styling is achieved strictly by consuming existing CSS custom properties.

---

## 🛠️ Development & Build Commands

```bash
# Install dependencies
pnpm install

# Start local development server (http://localhost:4321)
pnpm dev

# Build production bundle into dist/
pnpm run build

# Run automated acceptance and technical SEO verification (20/20 checks)
pnpm run verify

# Preview the production build locally
pnpm run preview
```

---

## 🌐 Ecosystem Links

- **Main Repository**: [github.com/Authkestra/authkestra](https://github.com/Authkestra/authkestra)
- **Documentation**: [docs.authkestra.com](https://docs.authkestra.com)
- **Interactive Playground**: [play.authkestra.com](https://play.authkestra.com)
- **Agent Skills Pack**: [github.com/Authkestra/skills](https://github.com/Authkestra/skills)
- **LLM Context**: [authkestra.com/llms.txt](https://authkestra.com/llms.txt) | [docs.authkestra.com/llms-full.txt](https://docs.authkestra.com/llms-full.txt)
- **crates.io**: [crates.io/crates/authkestra](https://crates.io/crates/authkestra)

---

## 📜 Licence

Dual-licensed under **MIT** or **Apache-2.0**, at your option. Matching the core framework.
