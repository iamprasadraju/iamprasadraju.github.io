---
layout: default
permalink: /notes/
title: Notes
nav: true
nav_order: 5
pagination:
  enabled: true
  collection: notes
  permalink: /page/:num/
  per_page: 10
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="post">

  <div class="header-bar">
    <h1>Notes</h1>
    <h2>Quick write-ups, ideas, and technical notes</h2>
  </div>

  <ul class="post-list">

    {% if page.pagination.enabled %}
      {% assign notelist = paginator.posts %}
    {% else %}
      {% assign notelist = site.notes %}
    {% endif %}

    {% for note in notelist %}

    {% if note.external_source == blank %}
      {% assign read_time = note.content | number_of_words | divided_by: 180 | plus: 1 %}
    {% else %}
      {% assign read_time = note.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
    {% endif %}
    {% assign year = note.date | date: "%Y" %}
    {% assign tags = note.tags | join: "" %}
    {% assign categories = note.categories | join: "" %}

    <li>
      <h3>
        {% if note.redirect == blank %}
          <a class="post-title" href="{{ note.url | relative_url }}">{{ note.title }}</a>
        {% elsif note.redirect contains '://' %}
          <a class="post-title" href="{{ note.redirect }}" target="_blank">{{ note.title }}</a>
          <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        {% else %}
          <a class="post-title" href="{{ note.redirect | relative_url }}">{{ note.title }}</a>
        {% endif %}
      </h3>
      <p>{{ note.description }}</p>
      <p class="post-meta">
        {{ read_time }} min read &nbsp; &middot; &nbsp;
        {{ note.date | date: '%B %d, %Y' }}
      </p>
      <p class="post-tags">
        <a href="{{ year | prepend: '/notes/' | relative_url }}">
          <i class="fa-solid fa-calendar fa-sm"></i> {{ year }}
        </a>

        {% if tags != "" %}
        &nbsp; &middot; &nbsp;
          {% for tag in note.tags %}
          <a href="{{ tag | slugify | prepend: '/notes/tag/' | relative_url }}">
            <i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}
          </a>
          {% unless forloop.last %}
            &nbsp;
          {% endunless %}
          {% endfor %}
        {% endif %}
      </p>
    </li>

    {% endfor %}

  </ul>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}

</div>
