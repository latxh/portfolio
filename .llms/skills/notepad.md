# Notepad Page — Skill Guide

> Reference for maintaining and extending the notepad page (`notepad.html`), a stacked mini-article journal.

---

## Overview

The notepad is a personal writing space at `/notepad.html`. It displays a vertical stack of self-contained mini articles, each separated by a subtle border. A sticky left sidebar lists all articles for quick navigation with scroll-spy highlighting, and a right sidebar holds contact links.

**Live URL:** `https://latchman.ca/notepad`

---

## Architecture

```
notepad.html          ← Page markup (all articles live here)
css/notepad.css       ← All notepad-specific styles
css/core-styles.css   ← Global design tokens, typography, responsive breakpoints
css/nav.css           ← Shared nav bar styles
css/tooltip.css       ← Tooltip component styles
js/app.js             ← Shared JS (canvas toggle, color picker, email copy)
js/canvas.js          ← Three.js background animation
```

The page is **static HTML/CSS/JS** — no build step, no framework. It's hosted on GitHub Pages.

---

## Layout Structure

The page uses a three-column CSS grid (`.docs-layout`):

| Column | Class | Purpose |
|---|---|---|
| Left (240px) | `.docs-sidebar` | Article list with scroll-spy |
| Center (1fr) | `.docs-content` (`<main>`) | Stacked `<article>` elements |
| Right (200px) | `.docs-on-page` | Contact links |

At `≤1236px` the right sidebar hides. At `≤940px` the left sidebar also hides, leaving single-column content.

---

## How to Add a New Article

### 1. Add the sidebar link

In the `<aside class="docs-sidebar">`, add a new `<li>` inside the `<ul>`. **Order matters** — newest articles go at the top of the list.

```html
<li><a href="#your-article-id">Article Title</a></li>
```

### 2. Add the article block

Inside `<main class="docs-content">`, add a new `<article>` element. **Newest articles go at the top**, directly after the opening `<main>` tag.

```html
<article class="notepad-article" id="your-article-id">
  <div class="article-header">
    <h1>Article Title</h1>
    <time>Month Day, Year</time>
  </div>

  <p>Your content here.</p>
</article>
```

### 3. That's it

The scroll-spy script automatically picks up any element with class `.notepad-article` — no JS changes needed.

---

## Article Anatomy

Every article follows this structure:

```html
<article class="notepad-article" id="unique-slug">
  <div class="article-header">
    <h1>Title</h1>
    <time>March 9, 2026</time>
  </div>

  <!-- Body content: paragraphs, subheadings, callouts, etc. -->
  <p>...</p>
  <h2 id="optional-subheading">Subheading</h2>
  <p>...</p>

  <!-- Optional closing divider + footnote (like the AI Prototyping article) -->
  <hr class="docs-divider" />
  <p>Footnote text.</p>
</article>
```

### Available content elements inside articles

- `<p>` — Body text (styled: `var(--font-2)`, 16px, 26px line-height)
- `<h2 id="...">` — Subheading (22px, 600 weight, 48px top margin)
- `<h3>` — Sub-subheading (18px, 600 weight)
- `<a href="..." target="_blank">` — Links (blue underline, hover → white)
- `<code>` — Inline code (mono font, pill background)
- `<pre><code>` — Code blocks (dark card with border)
- `<ul>` / `<ol>` — Lists
- `<div class="callout"><p>...</p></div>` — Highlighted quote block (blue left border)
- `<hr class="docs-divider" />` — Horizontal rule separator

---

## Design Tokens (from `core-styles.css`)

These CSS custom properties are used throughout:

| Token | Value | Usage |
|---|---|---|
| `--background` | `#101112` | Page background |
| `--font-1` | `#f3f4f5` | Primary text (headings, links on hover) |
| `--font-2` | `#9fa4ab` | Secondary text (body paragraphs, dates) |
| `--focus-blue` | `#78b0ff` | Accent color (links, callout border, active sidebar indicator) |
| `--button` | `#323338` | Borders, code pill backgrounds |
| `--work-background` | `#17181a` | Callout/code block backgrounds |

---

## Typography

The site uses a custom font family called **Latch** with three weights:

- `LatchRegular.otf` → `font-weight: 400` (body text)
- `LatchMedium.otf` → `font-weight: 600` (subheadings, sidebar)
- `LatchBold.otf` → `font-weight: 700` (article titles)

---

## Scroll-Spy Behavior

The inline `<script>` at the bottom of `notepad.html` handles scroll-spy:

- Queries all `.notepad-article` elements
- On scroll, determines which article's `offsetTop` is closest to the current scroll position
- Adds `.active` class to the corresponding `.docs-sidebar a[href="#id"]`
- Handles bottom-of-page edge case (activates last article)

The scroll-spy tracks **articles** (not individual `<h2>` subheadings). Each sidebar link corresponds to one `<article>` block.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 1236px` | Full three-column layout |
| `≤ 1236px` | Right sidebar hidden, two columns (sidebar + content) |
| `≤ 940px` | Left sidebar hidden, single column, reduced top padding |
| `≤ 670px` | Full-width content, no sidebars, tighter padding |

---

## Conventions & Style

- **Dark theme only** — no light mode
- **No JavaScript frameworks** — vanilla JS only
- **Newest articles first** — both in sidebar and in content
- Article IDs should be **kebab-case** slugs (e.g., `a-place-for-thoughts`, `ai-prototyping`)
- Dates use format: `Month Day, Year` (e.g., `March 8, 2026`)
- The `<time>` element inside `.article-header` is for display only (no `datetime` attribute required)
- Writing tone is casual and personal — this is a journal, not a blog
- Keep the nav bar identical to `index.html` (shared structure, not a component)

---

## File Relationships

- `notepad.html` links to `index.html` via the nav logo (`<a href="/">`)
- `index.html` links to `notepad.html` via the "Notepad →" banner in the nav
- Both pages share: `core-styles.css`, `nav.css`, `tooltip.css`, `app.js`, `canvas.js`
- `notepad.css` is **only** loaded on the notepad page
