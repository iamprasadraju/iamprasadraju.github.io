---
layout: page
title: Projects
permalink: /projects/
description: "Open-source projects by Prasad Raju G — machine learning frameworks, developer tools, algorithms libraries, and creative coding experiments."
---

{% assign sorted_projects = site.projects | sort: "date" | reverse %}
{% assign pinned = sorted_projects | where: "pinned", true %}
{% assign regular = sorted_projects | where_exp: "item", "item.pinned != true" %}

<style>
/* ── Bento Grid Layout ── */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 32px;
}

/* Pinned card spans full width */
.bento-card.pinned {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 280px;
}

.bento-card {
  position: relative;
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  will-change: box-shadow;
}

.bento-card:hover {
  border-color: rgba(128, 128, 128, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  text-decoration: none;
  color: inherit;
}

/* ── Card Content ── */
.bento-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
}

.bento-card.pinned .bento-body {
  padding: 36px;
}

.bento-status {
  display: inline-flex;
  align-items: center;
  color: #8b949e;
  margin-bottom: 12px;
}

.bento-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.bento-card.pinned .bento-title {
  font-size: 28px;
}

.bento-desc {
  font-size: 14px;
  line-height: 1.65;
  opacity: 0.7;
  margin: 0 0 20px 0;
  flex-grow: 1;
}

.bento-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.bento-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  opacity: 0.7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  letter-spacing: 0.3px;
}

/* ── Pinned Card Code Preview ── */
.bento-code-panel {
  background: rgba(0, 0, 0, 0.25);
  padding: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid rgba(128, 128, 128, 0.1);
  overflow: hidden;
}

.bento-code-panel pre {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #8b949e;
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  white-space: pre;
  overflow: hidden;
}

.bento-code-panel .kw { color: #ff7b72; }
.bento-code-panel .fn { color: #d2a8ff; }
.bento-code-panel .st { color: #a5d6ff; }
.bento-code-panel .cm { color: #484f58; }
.bento-code-panel .op { color: #c9d1d9; }

/* ── Arrow indicator ── */
.bento-arrow {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 18px;
  opacity: 0;
  transform: translate(-4px, 4px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.bento-card:hover .bento-arrow {
  opacity: 0.5;
  transform: translate(0, 0);
}

/* ── Light Theme Adjustments ── */
html[data-theme='classic'] .bento-code-panel {
  background: rgba(0, 0, 0, 0.04);
}

html[data-theme='classic'] .bento-card {
  border-color: rgba(0, 0, 0, 0.1);
}

html[data-theme='classic'] .bento-card:hover {
  border-color: rgba(0, 0, 0, 0.2);
}

html[data-theme='classic'] .bento-code-panel pre {
  color: #57606a;
}

html[data-theme='classic'] .bento-code-panel .kw { color: #cf222e; }
html[data-theme='classic'] .bento-code-panel .fn { color: #8250df; }
html[data-theme='classic'] .bento-code-panel .st { color: #0a3069; }
html[data-theme='classic'] .bento-code-panel .cm { color: #8c959f; }
html[data-theme='classic'] .bento-code-panel .op { color: #24292f; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 20px;
  }

  /* Pinned cards become single-column */
  .bento-card.pinned {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  /* Make code panel compact instead of hiding it */
  .bento-code-panel {
    border-left: none;
    border-top: 1px solid rgba(128, 128, 128, 0.1);
    padding: 16px;
    overflow-x: auto; /* Allow code to scroll horizontally if needed */
  }
  
  .bento-code-panel pre {
    font-size: 11px;
    line-height: 1.5;
  }

  /* Compact padding */
  .bento-body {
    padding: 18px;
  }
  .bento-card.pinned .bento-body {
    padding: 20px;
  }

  /* Smaller typography */
  .bento-title {
    font-size: 17px;
    margin-bottom: 6px;
  }
  .bento-card.pinned .bento-title {
    font-size: 19px;
  }
  .bento-desc {
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .bento-status {
    font-size: 10px;
    margin-bottom: 8px;
  }

  /* Compact tags */
  .bento-tags {
    gap: 4px;
  }
  .bento-tag {
    font-size: 10px;
    padding: 2px 8px;
  }

  /* Arrow always visible on touch */
  .bento-arrow {
    opacity: 0.35;
    transform: translate(0, 0);
    top: 16px;
    right: 16px;
    font-size: 15px;
  }

  .bento-card {
    border-radius: 10px;
  }
}
</style>

<div class="bento-grid">

{% for project in pinned %}
<a href="{{ project.url | relative_url }}" class="bento-card pinned">
  <div class="bento-body">
    <div>
      <div class="bento-status" aria-label="Pinned Project" title="Pinned Project">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg); opacity: 0.8;"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
      </div>
      <h3 class="bento-title">{{ project.title }}</h3>
      <p class="bento-desc">{{ project.description }}</p>
    </div>
    <div class="bento-tags">
      {% for tag in project.tags %}
      <span class="bento-tag">{{ tag }}</span>
      {% endfor %}
    </div>
  </div>
  <div class="bento-code-panel">
    {% if project.snippet %}
    <pre>{{ project.snippet }}</pre>
    {% else %}
    <pre><span class="cm"># {{ project.title }}</span>
{{ project.description | truncatewords: 15 }}</pre>
    {% endif %}
  </div>
  <span class="bento-arrow">↗</span>
</a>
{% endfor %}

{% for project in regular %}
<a href="{{ project.url | relative_url }}" class="bento-card">
  <div class="bento-body">
    <div>
      <h3 class="bento-title">{{ project.title }}</h3>
      <p class="bento-desc">{{ project.description }}</p>
    </div>
    <div class="bento-tags">
      {% for tag in project.tags %}
      <span class="bento-tag">{{ tag }}</span>
      {% endfor %}
    </div>
  </div>
  <span class="bento-arrow">↗</span>
</a>
{% endfor %}

</div>
