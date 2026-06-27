---
layout: page
title: Notes
permalink: /notes/
---

<style>
/* ── Dynamic Bento Grid ── */
.apple-bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 160px;
  gap: 16px;
  margin-top: 32px;
  grid-auto-flow: dense;
}

/* ── Base Widget (3D Wrapper) ── */
.widget {
  perspective: 1000px;
  text-decoration: none;
  color: inherit;
  display: block;
}

.widget-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: live-tile-flip 10s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite;
  animation-delay: calc(var(--index) * 1.5s);
}

@keyframes live-tile-flip {
  0%, 45% { transform: rotateX(0deg); }
  50%, 95% { transform: rotateX(-180deg); }
  100% { transform: rotateX(-360deg); }
}

/* ── Card Faces (Front and Back) ── */
.widget-front, .widget-back {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  box-sizing: border-box; /* CRITICAL FIX: prevents padding from causing overlap */
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(128, 128, 128, 0.08); /* Same color for both faces */
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.widget-back {
  transform: rotateX(180deg);
}

/* ── Content Wrapper (Blending Text Fade-Out) ── */
.widget-content-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}

/* ── Random Sizes ── */
.widget-large { grid-column: span 2; grid-row: span 2; }
.widget-vertical { grid-column: span 1; grid-row: span 2; }
.widget-small { grid-column: span 1; grid-row: span 1; }

/* ── Typography (Apple Style + Theme Agnostic) ── */
.widget-date {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  flex-shrink: 0;
}

/* Titles are now massively increased to fit the whole front card */
.widget-title {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 26px; /* Huge default for Vertical */
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.8px;
  color: var(--text-color); /* Overrides blue link color */
}

.widget-large .widget-title { 
  font-size: 38px; 
  letter-spacing: -1.2px;
}
.widget-small .widget-title { 
  font-size: 22px; 
  letter-spacing: -0.6px;
}

.widget-excerpt {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  color: var(--text-color); /* Overrides blue link color */
  opacity: 0.8;
  line-height: 1.5;
}

.widget-small .widget-excerpt { 
  font-size: 12px;
}

/* ── Tags Container ── */
.widget-tags {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
  height: 20px; 
  overflow: hidden;
}

.widget-tag {
  font-size: 10px;
  font-weight: 600;
  color: inherit;
  opacity: 0.8;
  background: rgba(128, 128, 128, 0.15);
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

/* ── Light Theme ── */
html[data-theme='classic'] .widget-front,
html[data-theme='classic'] .widget-back {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .apple-bento { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .apple-bento { grid-template-columns: repeat(2, 1fr); }
  .widget-large { grid-column: span 2; }
}
</style>

<div class="apple-bento">
  {% assign sorted_notes = site.notes | sort: "date" | reverse %}
  
  {% for note in sorted_notes %}
    
    {% assign title_len = note.title | size %}
    {% if note.description %}
      {% assign content_text = note.description %}
    {% else %}
      {% assign content_text = note.excerpt | strip_html %}
    {% endif %}
    {% assign content_len = content_text | size %}
    
    {% assign mod = title_len | plus: forloop.index0 | modulo: 2 %}
    
    {% if title_len >= 30 %}
      {% assign widget_class = "widget-vertical" %}
    {% else %}
      <!-- Short titles are square, but only allow large 2x2 if the description is long enough to fill it -->
      {% if mod == 0 and content_len > 120 %}
        {% assign widget_class = "widget-large" %}       <!-- 2x2 Square -->
      {% else %}
        {% assign widget_class = "widget-small" %}       <!-- 1x1 Square -->
      {% endif %}
    {% endif %}

    <a href="{{ note.url | relative_url }}" class="widget {{ widget_class }}" style="--index: {{ forloop.index0 }};">
      <div class="widget-inner">
        
        <!-- Front of Tile: Title and Tags with Blending Fade -->
        <div class="widget-front">
          <div class="widget-content-wrapper">
            <div class="widget-date">{{ note.date | date: "%b %d" }}</div>
            <h3 class="widget-title">{{ note.title | escape }}</h3>
          </div>
          
          {% if note.tags.size > 0 %}
          <div class="widget-tags">
            {% for tag in note.tags limit:4 %}
            <span class="widget-tag">{{ tag }}</span>
            {% endfor %}
          </div>
          {% endif %}
        </div>
        
        <!-- Back of Tile: Description with Blending Fade -->
        <div class="widget-back">
          <div class="widget-content-wrapper">
            <p class="widget-excerpt">
              {% if note.description %}
                {{ note.description }}
              {% else %}
                {{ note.excerpt | strip_html | truncatewords: 40 }}
              {% endif %}
            </p>
          </div>
        </div>
        
      </div>
    </a>
  {% endfor %}
</div>
