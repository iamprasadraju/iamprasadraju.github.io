---
layout: default
title: Notes
permalink: /notes/
---

<div class="page-content" style="padding-top: 2rem;">
  <div class="container">
    <main style="grid-column: 1 / -1;">
      <section>
        <h2 class="section-heading">Notes</h2>
        
        {% assign sorted_notes = site.notes | sort: 'date' | reverse %}
        {% for note in sorted_notes %}
          <section class="note-item">
            <h3>
              {% if note.url %}
                <a href="{{ note.url }}">{{ note.title }}</a>
              {% else %}
                {{ note.title }}
              {% endif %}
            </h3>
            {% if note.date %}<p class="section-label">{{ note.date | date: "%B %d, %Y" }}</p>{% endif %}
            {% if note.summary %}<p>{{ note.summary }}</p>{% endif %}
            {% if note.tags %}
              <div class="note-tags">
                {% for tag in note.tags %}<span class="tag">{{ tag }}</span>{% endfor %}
              </div>
            {% endif %}
          </section>
        {% endfor %}
      </section>
    </main>
  </div>
</div>
