---
layout: default
title: Blogs
permalink: /blogs/
---

<div class="page-content" style="padding-top: 2rem;">
  <div class="container">
    <main style="grid-column: 1 / -1;">
      <section>
        <h2 class="section-heading">Blog Posts</h2>
        
        {% for blog in site.blogs %}
          <section class="blog-item" style="display: flex; align-items: center; gap: 20px;">
            {% if blog.image %}
              <div class="blog-image">
                <img class="compact-image" src="{{ blog.image }}" alt="{{ blog.title }} Blog Image" style="max-width: 150px; height: auto;">
              </div>
            {% endif %}
            <div class="blog-details">
              <h3>
                {% if blog.blog_url %}
                  <a href="{{ blog.blog_url }}">{{ blog.title }}</a>
                {% else %}
                  {{ blog.title }}
                {% endif %}
              </h3>
              <p class="section-label">{{ blog.author }} {% if blog.relation %}({{ blog.relation }}){% endif %}</p>
              {% if blog.reference %}<p>{{ blog.reference }}</p>{% endif %}
            </div>
          </section>
        {% endfor %}
      </section>
    </main>
  </div>
</div>
