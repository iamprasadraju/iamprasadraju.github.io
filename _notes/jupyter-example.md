---
layout: post
title: jupyter notebook example
date: 2026-03-24
description: How to embed Jupyter notebooks in your notes.
tags: [python, jupyter]
categories: [notes]
---

This note demonstrates how to embed a Jupyter notebook directly into a page.

## Embedding a Notebook

Use the following Liquid snippet to embed an `.ipynb` file:

{::nomarkdown}
{% assign jupyter_path = 'assets/jupyter/blog.ipynb' | relative_url %}
{% capture notebook_exists %}{% file_exists assets/jupyter/blog.ipynb %}{% endcapture %}
{% if notebook_exists == 'true' %}
  {% jupyter_notebook jupyter_path %}
{% else %}
  <p>Notebook file not found. Place your <code>.ipynb</code> file in <code>assets/jupyter/</code>.</p>
{% endif %}
{:/nomarkdown}

## How to use this

1. Place your `.ipynb` file in `assets/jupyter/`
2. Copy the Liquid snippet above into any note or blog post
3. Update the path to point to your notebook file
4. The notebook is rendered at build time using `nbconvert`

The notebook automatically supports both light and dark themes.
