---
layout: post
title: jupyter notebook example
date: 2026-03-24
description: How to work with Jupyter notebooks in your projects.
tags: [python, jupyter]
categories: [notes]
---

This note demonstrates how to work with Jupyter notebooks in your projects.

## Embedding a Notebook

To embed a Jupyter notebook in your site, convert it to HTML using `nbconvert`:

```bash
jupyter nbconvert --to html your_notebook.ipynb
```

Then link to the generated HTML file or embed it in an iframe.

## Example

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title("Sine Wave")
plt.show()
```

## Tips

- Keep notebooks focused on one topic each
- Add markdown cells to explain your thought process
- Use `nbstripout` to remove output before committing to Git
- Consider using [Google Colab](https://colab.research.google.com/) for interactive notebooks
