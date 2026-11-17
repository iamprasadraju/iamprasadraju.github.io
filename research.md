---
layout: page
title: Research
permalink: /research/
---

{% assign sorted_research = site.research | sort: "date" | reverse %}

{% if sorted_research.size > 0 %}
  {% for paper in sorted_research %}
  {% endfor %}
{% else %}
<p style="margin-top: 32px; text-align: center; opacity: 0.5; font-size: 14px;">No research papers published yet.</p>
{% endif %}
