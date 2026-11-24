---
layout: page
title: Blogs
permalink: /blogs/
layout_class: index-page
description: "Notes and experiments on mathematics, machine learning, and the craft of learning — written to think clearly."
---

{% assign sorted_posts = site.posts | sort: "date" | reverse %}
{% assign latest = sorted_posts | first %}
{% assign archive = sorted_posts | slice: 1, sorted_posts.size %}
{% assign archive_by_year = archive | group_by_exp: "post", "post.date | date: '%Y'" %}

{% if sorted_posts.size > 0 %}
<section class="index-section">
  <div class="index-section-head">
    <span class="index-eyebrow">Latest Writing</span>
    <span class="index-rule"></span>
    <span class="index-count">{{ sorted_posts.size }} {% if sorted_posts.size == 1 %}post{% else %}posts{% endif %}</span>
  </div>

  <a href="{{ latest.url | relative_url }}" class="index-card blog-feature">
    <span class="blog-feature-ghost" aria-hidden="true">01</span>
    <span class="blog-feature-kicker">{{ latest.date | date: "%B %-d, %Y" }}</span>
    <h2 class="blog-feature-title">{{ latest.title | escape }}</h2>
    {% if latest.description or latest.excerpt %}
    <p class="blog-feature-desc">{{ latest.description | default: latest.excerpt | strip_html | strip }}</p>
    {% endif %}
    <div class="blog-feature-foot">
      <span class="blog-readtime">{{ latest.content | strip_html | number_of_words | divided_by: 200 | plus: 1 }} min read</span>
      {% if latest.tags.size > 0 %}
      <div class="blog-entry-tags">
        {% for tag in latest.tags %}
        <span class="index-tag">{{ tag }}</span>
        {% endfor %}
      </div>
      {% endif %}
      <span class="index-arrow" aria-hidden="true">↗</span>
    </div>
  </a>
</section>

{% if archive.size > 0 %}
<section class="index-section">
  <div class="index-section-head">
    <span class="index-eyebrow">Archive</span>
    <span class="index-rule"></span>
    <span class="index-count">{{ archive.size }} {% if archive.size == 1 %}older post{% else %}older posts{% endif %}</span>
  </div>

  {% assign counter = 0 %}
  {% for year in archive_by_year %}
  <div class="blog-year">
    <div class="blog-year-label">{{ year.name }}</div>

    {% for post in year.items %}
    {% assign counter = counter | plus: 1 %}
    {% assign idx = counter | plus: 1 %}
    <a href="{{ post.url | relative_url }}" class="index-card blog-entry">
      <div class="blog-entry-date">
        <span class="index-num">{% if idx < 10 %}0{% endif %}{{ idx }}</span>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d" }}</time>
      </div>

      <div class="blog-entry-main">
        <h3 class="blog-entry-title">{{ post.title | escape }}</h3>
        {% if post.description %}
        <p class="blog-entry-desc">{{ post.description | escape }}</p>
        {% elsif post.excerpt %}
        <p class="blog-entry-desc">{{ post.excerpt | strip_html | strip }}</p>
        {% endif %}
        {% if post.tags.size > 0 %}
        <div class="blog-entry-tags">
          {% for tag in post.tags %}
          <span class="index-tag">{{ tag }}</span>
          {% endfor %}
        </div>
        {% endif %}
      </div>

      <span class="index-arrow" aria-hidden="true">↗</span>
    </a>
    {% endfor %}
  </div>
  {% endfor %}
</section>
{% endif %}

{% else %}
<p class="index-empty">No posts yet.</p>
{% endif %}
