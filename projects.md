---
layout: page
title: Projects
permalink: /projects/
---


<div class="home">
  <ul class="post-list">
    {% assign sorted_projects = site.projects | sort: "date" | reverse %}
    {% for project in sorted_projects %}
      <li>
        <span class="post-meta">{{ project.date | date: "%b %-d, %Y" }}</span>
        <h3 style="margin-top: 0; padding-top: 0;">
          <a class="post-link" href="{{ project.url | relative_url }}">
            {{ project.title | escape }}
          </a>
        </h3>
        <p>{{ project.excerpt | strip_html | truncatewords: 40 }}</p>
      </li>
    {% endfor %}
  </ul>
</div>
