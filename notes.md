---
layout: page
title: Notes
permalink: /notes/
---

<div class="home">
  <ul class="post-list">
    {% for note in site.notes %}
      <li>
        <span class="post-meta">{{ note.date | date: "%b %-d, %Y" }}</span>
        <h3 style="margin-top: 0; padding-top: 0;">
          <a class="post-link" href="{{ note.url | relative_url }}">
            {{ note.title | escape }}
          </a>
        </h3>
        <p>{{ note.excerpt | strip_html | truncatewords: 40 }}</p>
      </li>
    {% endfor %}
  </ul>
</div>
