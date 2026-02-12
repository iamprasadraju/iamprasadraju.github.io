# Jekyll Portfolio Theme

A clean, responsive portfolio theme for Jekyll based on your existing design. All your content is now managed through Markdown files and Jekyll collections.

## 🚀 Quick Start

### Prerequisites

- Ruby 2.5 or higher
- RubyGems
- GCC and Make

### Installation

1. **Install Jekyll and Bundler**
   ```bash
   gem install jekyll bundler
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Run the site locally**
   ```bash
   bundle exec jekyll serve
   ```

4. **View your site**
   Open http://localhost:4000 in your browser

## 📁 Directory Structure

```
Portfolio_Generator/
├── _config.yml                 # Site configuration
├── _layouts/                   # Jekyll layouts
│   ├── default.html           # Base layout
│   ├── home.html              # Homepage layout
│   ├── project.html           # Individual project layout
│   └── projects.html          # Projects listing layout
├── _includes/                  # Reusable components
│   ├── navigation.html        # Navigation bar
│   ├── footer.html            # Footer
│   └── *.svg                  # Social icons
├── _projects/                  # Projects collection
│   ├── phonebook.md
│   └── music-genre-classification.md
├── _research/                  # Research collection
│   └── medical-image-analysis.md
├── _notes/                     # Notes collection
│   └── understanding-backpropagation.md
├── _blogs/                     # Blogs collection
│   └── what-is-an-image.md
├── assets/                     # Static assets
│   ├── css/                   # Stylesheets
│   └── js/                    # JavaScript
├── img/                        # Images
├── index.md                    # Homepage
├── projects.md                 # Projects page
├── research.md                 # Research page
├── blogs.md                    # Blogs page
├── notes.md                    # Notes page
└── Gemfile                     # Ruby dependencies
```

## 📝 Content Management

### Adding a New Project

Create a new file in `_projects/`:

```yaml
---
title: "Your Project Name"
summary: "Brief description of your project"
url: "https://github.com/username/repo"
logo: "https://example.com/logo.png"
highlights:
  - "Key feature 1"
  - "Key feature 2"
  - "Key feature 3"
images:
  - img_path: "https://example.com/image1.png"
    caption: "Screenshot 1"
  - img_path: "https://example.com/image2.png"
    caption: "Screenshot 2"
---

# Your Project Name

Write detailed project description here using Markdown.

## Features

- Feature 1
- Feature 2

## Technical Stack

- Technology 1
- Technology 2
```

### Adding Research

Create a new file in `_research/`:

```yaml
---
title: "Research Title"
organization: "Conference/Journal Name"
summary: "Brief summary"
url: "https://paper-url.com"
highlights:
  - "Achievement 1"
  - "Achievement 2"
images:
  - img_path: "https://example.com/figure.png"
    caption: "Figure 1"
---

## Abstract

Your research abstract here.

## Methodology

Research methods and approach.
```

### Adding Notes

Create a new file in `_notes/`:

```yaml
---
title: "Note Title"
date: "Jan 2025"
summary: "Brief summary"
url: "https://note-url.com"  # Optional
tags:
  - "Tag1"
  - "Tag2"
---

Your note content in Markdown.
```

### Adding Blog Posts

Create a new file in `_blogs/`:

```yaml
---
title: "Blog Post Title"
blog_url: "https://medium.com/post-url"
author: "on Medium (Jan 2025)"
reference: "Brief description"
image: "https://example.com/image.png"
---

Brief excerpt or additional content.
```

## ⚙️ Configuration

Edit `_config.yml` to customize:

```yaml
# Personal Info
name: "Your Name"
label: "Your Title"
email: "your@email.com"
github_username: yourusername

# Social Links
social_links:
  - label: "Portfolio"
    url: "https://yourportfolio.com"
    svg_path: "img/globe.svg"
  - label: "GitHub"
    url: "https://github.com/username"
    svg_path: "img/github.svg"

# Skills
skill_tags:
  - "Python"
  - "Machine Learning"
  # ...

# Interests
interests_tags:
  - name: "🤖 AI"
    color: "#b3d9f7"
```

## 🎨 Customization

### Colors and Styles

Edit `assets/css/main.css` to customize the theme. Key CSS variables:

```css
:root {
  --link-color: #0077cc;
  --link-color-hover: #00487c;
  --nav-bg-color: rgba(255, 255, 255, 0.72);
  --nav-link-hover: #0071e3;
}
```

### Layouts

- **default.html**: Base layout with navigation and footer
- **home.html**: Homepage with profile, skills, and sections
- **project.html**: Individual project detail page
- **projects.html**: Projects grid listing

### Includes

- **navigation.html**: Navigation bar
- **footer.html**: Compact footer
- **\*.svg**: Social media icons

## 🚀 Deployment

### GitHub Pages

1. Push to GitHub repository
2. Go to repository Settings → Pages
3. Select source: Deploy from a branch
4. Select branch: `main` and folder: `/ (root)`
5. Your site will be live at `https://username.github.io/repository-name/`

### Custom Domain

1. Add your domain to `_config.yml`:
   ```yaml
   url: "https://yourdomain.com"
   baseurl: ""
   ```
2. Create a `CNAME` file with your domain
3. Configure DNS records

## 📦 Building for Production

```bash
# Build the site
bundle exec jekyll build

# Build with production environment
JEKYLL_ENV=production bundle exec jekyll build
```

The built site will be in `_site/` directory.

## 🔧 Troubleshooting

### Common Issues

**Jekyll not found**
```bash
gem install jekyll bundler
```

**Bundle install fails**
```bash
bundle update
```

**Changes not reflecting**
```bash
bundle exec jekyll serve --livereload
```

**SCSS/SASS errors**
Make sure all CSS files are valid and in `assets/css/`

## 🎯 Features Preserved

✅ Apple-style glassmorphism navigation  
✅ Responsive grid layout  
✅ Compact project cards  
✅ GitHub activity graph  
✅ Skills and interests tags  
✅ Special thanks section  
✅ Language proficiency  
✅ Compact footer  
✅ Social links with icons  
✅ SEO optimization (jekyll-seo-tag)  
✅ Sitemap generation  
✅ RSS feed  

## 📄 License

This project is open source and available for personal use.

## 🙏 Credits

Original design converted from static HTML generator to Jekyll theme.
