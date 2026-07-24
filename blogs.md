---
layout: page
title: Blogs
permalink: /blogs/
---

<style>
.blog-list {
  list-style: none;
  margin: 32px 0 0 0;
  padding: 0;
}

.blog-item {
  padding: 20px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
}

.blog-item:first-child {
  padding-top: 0;
}

.blog-item:last-child {
  border-bottom: none;
}

.blog-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.blog-item-link:hover {
  text-decoration: none;
  color: inherit;
}

.blog-item-date {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.blog-item-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px 0;
  line-height: 1.3;
  letter-spacing: -0.4px;
  color: var(--text-color);
  transition: opacity 0.2s ease;
}

.blog-item-link:hover .blog-item-title {
  opacity: 0.7;
}

.blog-item-excerpt {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.7;
  color: var(--text-color);
  margin: 0 0 10px 0;
}

.blog-item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.blog-item-tag {
  font-size: 11px;
  font-weight: 600;
  color: inherit;
  opacity: 0.7;
  background: rgba(128, 128, 128, 0.12);
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.blog-empty {
  margin-top: 48px;
  text-align: center;
  opacity: 0.5;
  font-size: 14px;
}
</style>

{% assign sorted_posts = "" | split: "" %}
{% if site.blogs %}
  {% assign sorted_posts = site.blogs | sort: "date" | reverse %}
{% endif %}

{% if sorted_posts.size > 0 %}
<ul class="blog-list">
  {% for post in sorted_posts %}
  <li class="blog-item">
    <a href="{{ post.url | relative_url }}" class="blog-item-link">
      <div class="blog-item-date">{{ post.date | date: "%b %-d, %Y" }}</div>
      <h3 class="blog-item-title">{{ post.title | escape }}</h3>
      {% if post.excerpt %}
      <p class="blog-item-excerpt">{{ post.excerpt }}</p>
      {% endif %}
      {% if post.tags.size > 0 %}
      <div class="blog-item-tags">
        {% for tag in post.tags %}
        <span class="blog-item-tag">{{ tag }}</span>
        {% endfor %}
      </div>
      {% endif %}
    </a>
  </li>
  {% endfor %}
</ul>
{% else %}
<p class="blog-empty">No posts yet.</p>
{% endif %}