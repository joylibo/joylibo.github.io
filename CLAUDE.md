# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with hot reload at http://localhost:1313
npm run dev:local    # Dev server bound to 127.0.0.1:1314
npm run build        # Production build (minified, GC, template metrics)
npm run preview      # Preview production build with hot reload
npm run format       # Run Prettier on templates and CSS
npm run update-modules  # Update Hugo modules to latest versions
```

The dev server runs Hugo and the theme CSS generator concurrently via `concurrently`.

## Architecture

This is a **Hugo static site** using the `hugoplate` theme, deployed to GitHub Pages on push to `master`.

### Config layers
- `hugo.toml` — top-level Hugo settings (baseURL, theme, CJK support, syntax highlighting)
- `config/_default/params.toml` — site parameters (logo, navbar, metadata, feature flags)
- `config/_default/menus.en.toml` — nav and footer menus
- `config/_default/module.toml` — 25+ Hugo modules imported from `gethugothemes/hugo-modules` (search, PWA, icons, accordion, tabs, SEO tools, etc.)
- `data/theme.json` — design tokens (fonts, colors for light/dark mode) consumed by `scripts/themeGenerator.js`

### Theme CSS pipeline
`scripts/themeGenerator.js` reads `data/theme.json` and writes `themes/hugoplate/assets/css/generated-theme.css`. This must run before Hugo builds. Custom styles live in `assets/css/custom.css` (321 lines of CSS variables and component styles).

The site uses **LXGW WenKai** as its primary font and a teal/green accent color system (`#2E7A6E` light / `#4DB8A8` dark).

### Content structure
All content lives under `content/english/` (single language, English):
- `zero-to-fullstack/lessons/` — active course series with individual lesson articles
- `ai-agent/`, `deep-learning/` — planned course series (stubs)
- `blog/` — blog posts
- `sections/` — reusable page sections (testimonials, CTAs)

### Deployment
GitHub Actions (`.github/workflows/hugo.yaml`) runs on push to `master`:
1. Install Node deps → generate theme CSS → Hugo build → deploy to GitHub Pages
2. Hugo 0.160.0 extended, Go 1.26.0, Node 24
