---
layout: default
title: Research
permalink: /research/
---

<div class="page-content" style="padding-top: 2rem;">
  <div class="container">
    <main style="grid-column: 1 / -1;">
      <section>
        <h2 class="section-heading">Research</h2>
        
        {% assign sorted_research = site.research | sort: 'date' | reverse %}
        {% for item in sorted_research %}
          <section>
            <h3>
              {% if item.url %}
                <a href="{{ item.url }}">{{ item.title }}</a>
              {% else %}
                {{ item.title }}
              {% endif %}
            </h3>
            {% if item.date %}<p class="section-label">{{ item.date | date: "%B %d, %Y" }}</p>{% endif %}
            {% if item.organization %}<p class="section-label">{{ item.organization }}</p>{% endif %}
            {% if item.summary %}<p>{{ item.summary }}</p>{% endif %}
            {% if item.highlights %}
              <ul>
                {% for highlight in item.highlights %}<li>{{ highlight }}</li>{% endfor %}
              </ul>
            {% endif %}
            {% if item.images %}
              <div class="gallery main-gallery">
                {% for img in item.images %}
                  <figure>
                    <img class="compact-image" width="600" height="338" src="{{ img.img_path }}" alt="{{ img.caption }}">
                    <figcaption>{{ img.caption }}</figcaption>
                  </figure>
                {% endfor %}
              </div>
            {% endif %}
          </section>
        {% endfor %}
      </section>
    </main>
  </div>
</div>
