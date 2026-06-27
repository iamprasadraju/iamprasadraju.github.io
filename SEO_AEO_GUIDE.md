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

### A. Q&A Heading Style
Instead of generic headings, use question-based headings. Generative models match user queries to your headings.

**❌ Bad:** `## Features`  
**✅ Good:** `## What can Gen-CLI do?`

**❌ Bad:** `## Math`  
**✅ Good:** `## How does the algorithm optimize tensor multiplication?`

### B. Semantic Boldness
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

## 6. Global Site Infrastructure

### A. The `llms.txt` File
The root directory contains a file called `llms.txt`. This is an emerging standard for LLMs and Generative Engines. It is powered by Jekyll Liquid tags and will **automatically update itself** every time you add a new file to the `_projects` or `_notes` collections. It outputs a clean, markdown-based summary of your entire site for AI agents.

### B. Structured Data (JSON-LD)
Your site uses advanced Schema.org JSON-LD structured data to prove your entity authority to search engines. 
- **Location:** The schemas are injected globally via `_includes/custom-head.html`. 
- **Schemas Used:** It injects `Person`, `WebSite`, and `ProfilePage` metadata. 
- **Customization:** If you want to add new social media profiles or update your bio globally, edit the JSON inside `_includes/custom-head.html`.

### C. Google Search Console
When you are ready to track your site's performance on Google, navigate to `_includes/custom-head.html` and replace the placeholder with your Google Site Verification meta tag.
