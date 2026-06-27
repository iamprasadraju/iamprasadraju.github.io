# SEO & AEO (AI) Formatting Guide

This document is a reference guide for properly formatting your Jekyll Markdown files (`_notes`, `_projects`, `_posts`) to ensure they are highly optimized for traditional Search Engines (SEO), LLM Answer Engines (AEO like ChatGPT/Perplexity), and Google AI Overviews (GEO).

## 1. YAML Front Matter Rules
Every markdown file must have rich metadata in the front matter block. If you do not provide this, search engines will guess (often poorly) what your page is about.

```yaml
---
layout: page
title: "Your Project Name"
date: 2026-06-27
description: "A 1-2 sentence extremely concise summary of what this is. This text is injected directly into Google's search results and Twitter link previews."
image: "/assets/my-thumbnail.png" # Optional, but highly recommended for rich link previews
---
```

## 2. AEO (Answer Engine) Content Structure
LLMs don't read websites visually—they scrape and summarize text. Follow these structural rules:

### A. The "TL;DR" Block
Always include a short TL;DR at the absolute top of the content body. LLMs heavily bias toward extracting bullet points placed at the top of a document.

```markdown
### TL;DR
- **Built with:** Python, PyTorch
- **Goal:** Reproduce [Specific Paper]
- **Result:** Achieved 95% accuracy using novel optimization technique.
```

### B. Q&A Heading Style
Instead of generic headings, use question-based headings. Generative models match user queries to your headings.

**❌ Bad:** `## Features`  
**✅ Good:** `## What can Gen-CLI do?`

**❌ Bad:** `## Math`  
**✅ Good:** `## How does the algorithm optimize tensor multiplication?`

### C. Semantic Boldness
When stating facts or defining terms, use bold text. LLM scrapers weigh bold text (`**text**`) higher than normal text when extracting entity definitions.
*Example:* "**Gen-CLI** is a Python-based command-line tool..."

## 3. GEO (Generative Engine) Authority Rules
To rank in AI Overviews, you must prove you are authoritative. 
*   **Outbound Links:** Always hyperlink to authoritative sources. If you mention PyTorch, link to the PyTorch docs. If you mention an algorithm, link to the arXiv paper. 
*   **Entity Consistency:** You are an "Entity". The JSON-LD schema on your homepage links your website to your GitHub and Google Scholar. Maintain consistent naming across platforms.

## 4. Accessibility (a11y)
Whenever you write custom HTML (like custom SVG icons), **always** include an `aria-label`. 
```html
<a href="https://github.com" aria-label="GitHub Profile">
  <svg>...</svg>
</a>
```
Search engines penalize sites with unreadable graphical links.

## 5. RSS Feeds
Your site automatically maintains several feeds. You do not need to do anything manually, but be aware of them:
- **Master Feed:** `feed.xml`
- **Projects Feed:** `feed/projects.xml`
- **Notes Feed:** `feed/notes.xml`
