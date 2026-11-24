---
layout: page
title: Projects
permalink: /projects/
layout_class: index-page
description: "Open-source projects by Prasad Raju G — machine learning frameworks, developer tools, algorithms libraries, and creative coding experiments."
---

{% assign projects_sorted = site.projects | sort: "date" | reverse %}
{% assign pinned = projects_sorted | where: "pinned", true %}
{% assign regular = projects_sorted | where_exp: "project", "project.pinned != true" %}

{% if site.projects.size > 0 %}
<section class="index-section">
  <div class="index-section-head">
    <span class="index-eyebrow">Projects</span>
    <span class="index-rule"></span>
    <span class="index-count">{{ site.projects.size }} total</span>
  </div>

  {% if pinned.size > 0 %}
  <div class="featured-projects">
    {% for project in pinned %}
    <a href="{{ project.url | relative_url }}" class="index-card project-feature">
      <div class="project-feature-body">
        <span class="project-feature-ghost" aria-hidden="true">{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}</span>

        <div class="project-logo project-logo--feature{% if project.logo_dark %} has-dark{% endif %}">
          {% if project.logo %}
          <img class="logo-light" src="{{ project.logo | relative_url }}" alt="{{ project.title | escape }}">
          {% if project.logo_dark %}
          <img class="logo-dark" src="{{ project.logo_dark | relative_url }}" alt="{{ project.title | escape }}">
          {% endif %}
          {% else %}
          <span class="project-monogram">{{ project.title | slice: 0, 2 | upcase }}</span>
          {% endif %}
        </div>

        <p class="project-feature-desc">{{ project.description | escape }}</p>

        <div class="project-feature-foot">
          <span class="project-meta">
            <span>{{ project.date | date: "%Y" }}</span>
            {% if project.repo %}<span>Open Source</span>{% endif %}
          </span>
          <span class="index-arrow" aria-hidden="true">↗</span>
        </div>
      </div>

      <div class="terminal">
        <div class="terminal-bar" aria-hidden="true">
          <span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span>
          <span class="terminal-file">{{ project.terminal_label | default: "readme.md" | escape }}</span>
        </div>
        <pre>{% if project.snippet %}{{ project.snippet }}{% else %}<span class="cm"># {{ project.title | escape }}</span>
<span class="cm">{{ project.description | truncatewords: 12 | escape }}</span>{% endif %}</pre>
      </div>
    </a>
    {% endfor %}
  </div>
  {% endif %}

  {% if regular.size > 0 %}
  <div class="project-grid">
    {% for project in regular %}
    {% assign idx = forloop.index | plus: pinned.size %}
    <a href="{{ project.url | relative_url }}" class="index-card project-card{% if project.logo_invert %} logo-invert{% endif %}">
      <span class="project-card-ghost" aria-hidden="true">{% if idx < 10 %}0{% endif %}{{ idx }}</span>

      <div class="project-card-head">
        <div class="project-logo{% if project.logo_dark %} has-dark{% endif %}">
          {% if project.logo %}
          <img class="logo-light" src="{{ project.logo | relative_url }}" alt="{{ project.title | escape }}">
          {% if project.logo_dark %}
          <img class="logo-dark" src="{{ project.logo_dark | relative_url }}" alt="{{ project.title | escape }}">
          {% endif %}
          {% else %}
          <span class="project-monogram">{{ project.title | slice: 0, 2 | upcase }}</span>
          {% endif %}
        </div>
      </div>

      <p class="project-card-desc">{{ project.description | escape }}</p>

      <div class="project-card-foot">
        <span class="project-meta">
          <span>{{ project.date | date: "%Y" }}</span>
          {% if project.repo %}<span>Open Source</span>{% endif %}
        </span>
        <span class="index-arrow" aria-hidden="true">↗</span>
      </div>
    </a>
    {% endfor %}
  </div>
  {% endif %}
</section>
{% else %}
<p class="index-empty">No projects yet.</p>
{% endif %}
