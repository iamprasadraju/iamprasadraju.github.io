# Jekyll Portfolio Theme

A clean, responsive portfolio website built with Jekyll.

## 🚀 Quick Start

```bash
# Install dependencies
bundle install

# Run locally (using the script)
./run.sh

# Or run manually
bundle exec jekyll serve

# Visit http://localhost:4000
```

**Requirements:**
- Ruby 3.0+
- Bundler gem (`gem install bundler`)

**Note:** If you encounter errors about missing gems (csv, base64, bigdecimal), run `bundle install` again. These are required for Ruby 3.4+ compatibility.

## 📁 Structure

```
├── _config.yml          # Site configuration
├── _layouts/            # Page layouts
│   ├── default.html
│   ├── home.html
│   ├── project.html
│   └── projects.html
├── _includes/           # Components & icons
│   ├── navigation.html
│   ├── footer.html
│   └── *.svg (18 icons)
├── _projects/           # Your projects (2)
├── _research/           # Research papers (2)
├── _notes/              # Technical notes (3)
├── _blogs/              # Blog posts (1)
├── assets/
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript
├── img/                 # Images
├── *.md                 # Site pages
├── Gemfile              # Dependencies
└── README.md            # This file
```

## 📝 Adding Content

### New Project
Create `_projects/my-project.md`:

```yaml
---
title: "Project Name"
summary: "Brief description"
url: "https://github.com/..."
logo: "https://.../logo.png"
highlights:
  - "Feature 1"
  - "Feature 2"
---

Your markdown content here.
```

### Customize
Edit `_config.yml` to update:
- Personal info & bio
- Social links
- Skills & interests
- Special thanks

## 🌐 Deploy

Push to GitHub and enable GitHub Pages. Jekyll builds automatically.

**URL:** `https://username.github.io/repository-name/`

## 📚 Documentation

- `JEKYLL_README.md` - Complete documentation
- Jekyll docs: https://jekyllrb.com/

## ✨ Features

- Apple-style glassmorphism navigation
- Responsive project cards
- GitHub activity graph
- Skills & interests tags
- Markdown content
- SEO optimized
