# Prasad Raju G — Engineering Portfolio

Welcome to the source code for my professional portfolio. This is a highly customized, ultra-performant, and heavily SEO/AI-optimized static site powered by Jekyll. 

This `README.md` serves as the master documentation for the architecture, content writing standards, and configuration of the site.

---

## 🚀 Setup & Local Development

1. **Install Dependencies:** Ensure you have Ruby and Bundler installed, then run:
   ```bash
   bundle install
   ```
2. **Run Locally:**
   ```bash
   bundle exec jekyll serve --livereload
   ```
3. Your site will be available at `http://localhost:4000/`.

---

## 📝 Writing Content (Projects, Notes, Research)

Content is divided into dedicated Jekyll collections (`_projects`, `_notes`, and `_research`). Every markdown file you create **must** begin with a YAML front matter block to ensure it renders correctly and is accurately indexed by search engines.

### The Required YAML Template

```yaml
---
layout: page
title: "Your Post Title Here"
date: YYYY-MM-DD
description: "A 1-2 sentence concise summary. This is injected into Google search results and Twitter link previews."
tags: [Machine Learning, Python, Systems Design]
math: true       # Optional: Set to true if using KaTeX ($$ equations $$)
mermaid: true    # Optional: Set to true if using Mermaid flowcharts
image: "/assets/my-thumbnail.png" # Optional: Strongly recommended for rich embeds
---
```

### Best Practices for Content
- **Naming Convention:** Name your files `YYYY-MM-DD-title-of-post.md` (e.g., `2026-06-27-neural-networks.md`).
- **Heavy Scripts (KaTeX & Mermaid):** To maintain the site's `100/100` Lighthouse performance score, heavy JavaScript libraries do not load globally. They *only* load on pages where you explicitly define `math: true` or `mermaid: true` (or if you include `$$` / `mermaid` in the body).
- **Images:** Always use `.webp` format for images instead of `.png` or `.jpg` to prevent layout shifts and bloat.

---

## 🤖 SEO, AEO, & GEO Master Rules

This site is deeply optimized not just for traditional search engines (Google), but for LLM Answer Engines (ChatGPT, Perplexity) and Generative Engine Optimization (GEO). 

When writing your markdown files, strictly adhere to the following rules:

### 1. Q&A Heading Style
Generative AI matches user queries to your headings. Avoid generic, one-word headers.
- **❌ Bad:** `## Features`
- **✅ Good:** `## What can Gen-CLI do?`
- **❌ Bad:** `## Architecture`
- **✅ Good:** `## How does the system handle concurrent requests?`

### 2. Semantic Boldness
When stating facts or defining terms, use **bold text**. LLM scrapers weigh bold text (`**text**`) higher than normal text when extracting entity definitions. 
- *Example:* "**TrueML** is a zero-abstraction framework designed for..."

### 3. Outbound Authority
To rank in AI Overviews, you must prove you are an authority. Always hyperlink to canonical sources. If you mention PyTorch, link to the PyTorch docs. If you mention an algorithm, link to the original arXiv paper.

### 4. No TL;DR Blocks
Do not include arbitrary `### TL;DR` blocks at the top of files. The site architecture relies on clean markdown and the `description` metadata in the YAML block to feed summaries to AI bots.

---

## ⚙️ Site Architecture & Configuration

The site includes advanced automation under the hood. You rarely need to touch these files, but here is how they work:

### 1. `_config.yml` (Global Settings)
This is where you update your primary site metadata.
- Change your Site `title`, `description`, and `email`.
- Update `social_links` (these automatically populate the footer and header icons).
- Contains the strict sitemap hierarchy (`changefreq` and `priority` for search engines).

### 2. `llms.txt` (Agentic Web)
An emerging standard for AI crawlers. It uses Liquid templating to automatically recompile a machine-readable summary of your entire portfolio every time you publish a new project or note.

### 3. `_includes/head.html` & `custom-head.html`
- **SEO Schemas:** Automatically injects Schema.org JSON-LD structured data (`Person`, `WebSite`, `ProfilePage`) proving your identity to Google.
- **Performance:** Handles preconnect hints, async CSS loading, and LCP image preloading.

### 4. The Theme Switcher
The site extends the standard Minima theme with a fully functional skin switcher.
- **`_plugins/skin_manager.rb`:** Generates CSS for multiple Minima variants.
- **`_includes/sub-footer.html`:** Controls the frontend toggle and stores user preferences in `localStorage`.
- **`_sass/minima/custom-styles.scss`:** Where you should write any custom CSS overrides (like the hero header styles or global animations).

---
*Maintained and optimized for performance, accessibility, and the generative web.*
