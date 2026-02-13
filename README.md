# Jekyll Portfolio Theme

A clean, modern, and responsive portfolio website built with [Jekyll](https://jekyllrb.com/). This portfolio features an Apple-style glassmorphism design, responsive grid layouts, and easy content management through Markdown files.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Directory Structure](#directory-structure)
- [Creating Content](#creating-content)
  - [Adding Projects](#adding-projects)
  - [Adding Research Papers](#adding-research-papers)
  - [Adding Notes](#adding-notes)
  - [Adding Blog Posts](#adding-blog-posts)
- [Customizing Your Site](#customizing-your-site)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby** 3.0 or higher
  - Check version: `ruby --version`
  - Installation: https://www.ruby-lang.org/en/documentation/installation/
  
- **RubyGems** (usually comes with Ruby)
  - Check: `gem --version`

- **Bundler**
  - Install: `gem install bundler`

- **Git** (optional, for version control)
  - Install: https://git-scm.com/downloads

---

## Setup & Installation

### Step 1: Clone or Download the Repository

```bash
# Using Git
git clone https://github.com/yourusername/Portfolio.git
cd Portfolio

# Or download and extract the ZIP file
cd /path/to/Portfolio
```

### Step 2: Install Dependencies

```bash
bundle install
```

This command installs all required Ruby gems specified in the `Gemfile`, including:
- Jekyll 4.3.0
- Jekyll plugins (feed, sitemap, SEO)
- Required gems for Ruby 3.4+ compatibility (csv, base64, bigdecimal)

**Note:** If you encounter errors about missing gems, simply run `bundle install` again.

### Step 3: Verify Installation

```bash
# Check Jekyll installation
jekyll --version

# Should output: jekyll 4.3.x
```

---

## Directory Structure

```
Portfolio/
├── _config.yml              # Main site configuration
├── _config_dev.yml          # Development overrides
├── Gemfile                  # Ruby dependencies
├── run.sh                   # Quick start script
│
├── _layouts/                # HTML layout templates
│   ├── default.html         # Base layout (used by all pages)
│   ├── home.html            # Homepage layout
│   ├── project.html         # Individual project page layout
│   └── projects.html        # Projects listing layout
│
├── _includes/               # Reusable components
│   ├── navigation.html      # Top navigation bar
│   ├── footer.html          # Site footer
│   └── *.svg                # Social media icons (18 icons)
│
├── _sass/                   # SCSS partials (if using Sass)
│
├── _projects/               # Project collection (individual projects)
│   ├── phonebook.md
│   └── music-genre-classification.md
│
├── _research/               # Research papers collection
│   ├── medical-image-analysis.md
│   └── nlp-sentiment-analysis.md
│
├── _notes/                  # Technical notes collection
│   ├── understanding-backpropagation.md
│   ├── docker-best-practices.md
│   └── python-memory-management.md
│
├── _blogs/                  # Blog posts collection
│   └── what-is-an-image.md
│
├── assets/                  # Static assets
│   ├── css/                 # Stylesheets
│   └── js/                  # JavaScript files
│
├── img/                     # Images directory
│
├── index.md                 # Homepage
├── projects.md              # Projects listing page
├── research.md              # Research listing page
├── notes.md                 # Notes listing page
├── blogs.md                 # Blogs listing page
│
├── _site/                   # Generated site (auto-created, don't edit)
└── .jekyll-cache/           # Jekyll cache (auto-created)
```

---

## Creating Content

All content is written in **Markdown** (`.md`) files with YAML front matter at the top. Each collection has its own specific front matter variables.

### File Naming Convention

- Use lowercase letters
- Use hyphens for spaces: `my-project-name.md`
- Avoid special characters

### General Front Matter Format

Every content file starts with front matter between triple dashes:

```yaml
---
title: "Your Title"
other_field: "value"
---

Your markdown content here...
```

---

## Adding Projects

Projects are stored in the `_projects/` directory and appear on the Projects page.

### Step-by-Step Guide

1. **Create a new file** in `_projects/`:
   ```bash
   touch _projects/my-awesome-project.md
   ```

2. **Add front matter** (required fields):
   ```yaml
   ---
   title: "My Awesome Project"
   summary: "A brief description of what this project does (1-2 sentences)"
   url: "https://github.com/username/repository"
   logo: "https://example.com/project-logo.png"
   highlights:
     - "Key feature or achievement 1"
     - "Key feature or achievement 2"
     - "Key feature or achievement 3"
   images:
     - img_path: "https://example.com/screenshot1.png"
       caption: "Screenshot showing main feature"
     - img_path: "https://example.com/screenshot2.png"
       caption: "Another view of the application"
   ---
   ```

3. **Add content body** (optional but recommended):
   ```markdown
   # My Awesome Project

   ## Overview
   Provide a detailed description of your project here.

   ## Features
   - Feature 1 with explanation
   - Feature 2 with explanation
   - Feature 3 with explanation

   ## Technical Stack
   - Technology 1
   - Technology 2
   - Technology 3

   ## Getting Started
   Installation instructions or usage examples.

   ## Challenges & Solutions
   Discuss any interesting problems you solved.
   ```

### Front Matter Reference for Projects

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Project name |
| `summary` | string | Yes | Brief description (shown on cards) |
| `url` | string | Yes | GitHub or live project URL |
| `logo` | string | No | Project logo/image URL |
| `highlights` | array | No | List of key features/achievements |
| `images` | array | No | Screenshots with captions |

---

## Adding Research Papers

Research papers are stored in the `_research/` directory.

### Step-by-Step Guide

1. **Create a new file** in `_research/`:
   ```bash
   touch _research/deep-learning-research.md
   ```

2. **Add front matter**:
   ```yaml
   ---
   title: "Deep Learning for Computer Vision"
   organization: "Published at IEEE Conference 2024"
   summary: "Brief overview of the research and key findings"
   url: "https://doi.org/10.xxxx/research"
   highlights:
     - "Achieved 95% accuracy on benchmark dataset"
     - "Novel architecture reducing parameters by 40%"
     - "Open-sourced code and dataset"
   images:
     - img_path: "https://example.com/architecture-diagram.png"
       caption: "Proposed network architecture"
     - img_path: "https://example.com/results-chart.png"
       caption: "Performance comparison results"
   ---
   ```

3. **Add research content**:
   ```markdown
   ## Abstract
   Provide the abstract or summary of your research.

   ## Introduction
   Background and motivation for the research.

   ## Methodology
   Detailed explanation of your approach.

   ## Results
   Key findings and performance metrics.

   ## Conclusion
   Summary and future work.
   ```

### Front Matter Reference for Research

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Research paper title |
| `organization` | string | Yes | Conference/journal name |
| `summary` | string | Yes | Brief overview |
| `url` | string | Yes | Paper DOI or PDF link |
| `highlights` | array | No | Key achievements |
| `images` | array | No | Figures and diagrams |

---

## Adding Notes

Technical notes are stored in the `_notes/` directory. These are shorter, focused pieces of content.

### Step-by-Step Guide

1. **Create a new file** in `_notes/`:
   ```bash
   touch _notes/python-tips.md
   ```

2. **Add front matter**:
   ```yaml
   ---
   title: "Python Performance Tips"
   date: "Jan 2025"
   summary: "Collection of tips for writing efficient Python code"
   url: "https://example.com/notes/python"  # Optional external link
   tags:
     - "Python"
     - "Performance"
     - "Best Practices"
   ---
   ```

3. **Add note content**:
   ```markdown
   ## Tip 1: Use List Comprehensions
   
   Instead of:
   ```python
   squares = []
   for x in range(1000):
       squares.append(x**2)
   ```
   
   Use:
   ```python
   squares = [x**2 for x in range(1000)]
   ```

   ## Tip 2: Use Generators for Large Data

   When processing large datasets, use generators to save memory.
   ```python
   def read_large_file(file_path):
       with open(file_path, 'r') as f:
           for line in f:
               yield line.strip()
   ```
   ```

### Front Matter Reference for Notes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Note title |
| `date` | string | Yes | Publication date |
| `summary` | string | Yes | Brief description |
| `url` | string | No | External link (optional) |
| `tags` | array | No | Categories/tags |

---

## Adding Blog Posts

Blog posts are stored in the `_blogs/` directory.

### Step-by-Step Guide

1. **Create a new file** in `_blogs/`:
   ```bash
   touch _blogs/my-new-blog-post.md
   ```

2. **Add front matter**:
   ```yaml
   ---
   title: "Understanding Neural Networks"
   blog_url: "https://medium.com/@username/neural-networks-post"
   author: "on Medium (Feb 2025)"
   reference: "A comprehensive guide to neural network fundamentals"
   image: "https://miro.medium.com/v2/resize:fit/786/1*abc123.png"
   ---
   ```

3. **Add content excerpt** (optional):
   ```markdown
   ## Introduction

   Neural networks are the foundation of modern AI. In this post, we'll explore...

   ## Key Topics Covered

   - Perceptrons and activation functions
   - Backpropagation algorithm
   - Common architectures (CNN, RNN, Transformers)
   - Practical implementation tips

   Read the full article on Medium for detailed explanations and code examples.
   ```

### Front Matter Reference for Blog Posts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Blog post title |
| `blog_url` | string | Yes | Link to full blog post |
| `author` | string | Yes | Author and platform info |
| `reference` | string | Yes | Short description |
| `image` | string | No | Featured image URL |

---

## Customizing Your Site

### Editing Personal Information

Open `_config.yml` and update the following sections:

```yaml
# Site settings
title: "Your Name"
description: "Your professional title and tagline"
url: "https://yourusername.github.io"

# Personal info
name: "Your Full Name"
label: "Your Job Title"
image_path: "img/your-photo.jpg"
github_username: yourusername

# Contact
contact:
    email: "your.email@example.com"
    location: "Your City, Country"

# Summary
summary: "A brief bio about yourself (1-2 sentences)"
```

### Adding/Editing Social Links

In `_config.yml`, find the `social_links` section:

```yaml
social_links:
    - label: "LinkedIn"
      url: "https://linkedin.com/in/yourusername"
      svg_path: "linkedin.svg"
    - label: "GitHub"
      url: "https://github.com/yourusername"
      svg_path: "github.svg"
    - label: "Twitter"
      url: "https://twitter.com/yourusername"
      svg_path: "twitter.svg"
    - label: "Personal Website"
      url: "https://yourwebsite.com"
      svg_path: "globe.svg"
```

**Available icons** in `_includes/`:
- `github.svg`, `linkedin.svg`, `twitter.svg`, `medium.svg`
- `globe.svg`, `mail.svg`, `youtube.svg`, `instagram.svg`
- `facebook.svg`, `gitlab.svg`, `stackoverflow.svg`, `rss.svg`
- And more...

### Editing Skills

```yaml
skill_tags:
    - "Python"
    - "JavaScript"
    - "Machine Learning"
    - "React"
    - "Node.js"
    - "Docker"
    # Add or remove as needed
```

### Editing Interests

```yaml
interests_tags:
    - name: "🤖 Artificial Intelligence"
      color: "#b3d9f7"
    - name: "🌐 Web Development"
      color: "#ffcc80"
    # The color field uses hex color codes
```

### Adding Special Thanks

```yaml
special_thanks:
    - "Prof. Jane Doe"
    - "Mentor Name"
    - "Organization Name"
```

### Adding Languages

```yaml
languages:
    - language: "English"
      fluency: "Native"
    - language: "Spanish"
      fluency: "Conversational"
    - language: "French"
      fluency: "Beginner"
```

---

## Running Locally

### Option 1: Using the Provided Script (Recommended)

```bash
./run.sh
```

This script:
- Checks if dependencies are installed
- Installs them if needed
- Starts the Jekyll server with livereload
- Opens at `http://localhost:4000`

### Option 2: Manual Commands

```bash
# Install dependencies (first time only)
bundle install

# Run development server
bundle exec jekyll serve --livereload

# With custom config (uses _config_dev.yml for local development)
bundle exec jekyll serve --livereload --config _config.yml,_config_dev.yml
```

### Accessing the Site

Once running, open your browser to:
```
http://localhost:4000
```

**Live Reload:**
- The `--livereload` flag automatically refreshes the browser when you save changes
- Changes to `_config.yml` require restarting the server

### Stopping the Server

Press `Ctrl + C` in the terminal to stop the server.

---

## Deployment

### Deploying to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial portfolio commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Scroll down to **Pages** section
   - Under **Source**, select **Deploy from a branch**
   - Select `main` branch and `/ (root)` folder
   - Click **Save**

3. **Wait for deployment**:
   - GitHub will build and deploy your site
   - This usually takes 1-2 minutes
   - Your site will be live at: `https://yourusername.github.io/repository-name/`

4. **Update `_config.yml`** for production:
   ```yaml
   baseurl: "/repository-name"  # If your repo is not the main user site
   url: "https://yourusername.github.io"
   ```

### Deploying to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click **New site from Git**
4. Select your repository
5. Build settings:
   - Build command: `jekyll build`
   - Publish directory: `_site`
6. Click **Deploy site**

### Custom Domain Setup

1. **Purchase a domain** from a registrar (Namecheap, GoDaddy, etc.)

2. **Add to `_config.yml`**:
   ```yaml
   url: "https://www.yourdomain.com"
   baseurl: ""
   ```

3. **Create a `CNAME` file** in your repository root:
   ```
   www.yourdomain.com
   ```

4. **Configure DNS** with your registrar:
   - Add a CNAME record:
     - Name: `www`
     - Value: `yourusername.github.io`
   - Add an A record for apex domain (optional):
     - Name: `@`
     - Value: GitHub Pages IP addresses (found in GitHub docs)

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Jekyll not found" Error

**Problem:**
```
command not found: jekyll
```

**Solution:**
```bash
gem install jekyll bundler
```

#### 2. Bundle Install Fails

**Problem:**
Installation errors or permission issues

**Solution:**
```bash
# Update bundler
gem install bundler

# Clear cache and reinstall
bundle clean --force
bundle install
```

#### 3. "Cannot load such file" Errors

**Problem:**
Missing required gems for Ruby 3.4+

**Solution:**
```bash
bundle install
# Run again if needed
bundle install
```

#### 4. Changes Not Reflecting

**Problem:**
You've made changes but don't see them in the browser

**Solutions:**
- Check if server is running
- Try hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Restart Jekyll server (especially after changing `_config.yml`)
- Check for syntax errors in your markdown files

#### 5. SCSS/SASS Compilation Errors

**Problem:**
CSS-related errors during build

**Solution:**
- Ensure CSS files are valid
- Check that files are in `assets/css/`
- Run: `bundle exec jekyll build --trace` for detailed error output

#### 6. "Address already in use" Error

**Problem:**
```
Address already in use - bind(2) for "127.0.0.1" port 4000
```

**Solution:**
```bash
# Kill existing Jekyll process or use different port
bundle exec jekyll serve --port 4001
```

#### 7. Images Not Loading

**Problem:**
Images appear broken on the site

**Solutions:**
- Check the path is correct (relative to site root)
- Verify the image exists in the `img/` directory
- For external images, ensure the URL is accessible
- Use absolute URLs for external images: `https://...`

### Getting Help

- **Jekyll Documentation**: https://jekyllrb.com/docs/
- **Liquid Syntax**: https://shopify.github.io/liquid/
- **Markdown Guide**: https://www.markdownguide.org/

---

## Additional Features

### SEO Optimization

The site includes automatic SEO through the `jekyll-seo-tag` plugin. SEO information is generated from:
- `_config.yml` (site title, description, author)
- Page front matter (title, description)
- Social media metadata

### Sitemap Generation

A sitemap is automatically generated at `/sitemap.xml` to help search engines index your site.

### RSS Feed

An RSS feed is available at `/feed.xml` for blog posts.

### Google Analytics (Optional)

To add Google Analytics:

1. Sign up at [Google Analytics](https://analytics.google.com)
2. Get your tracking ID (e.g., `G-XXXXXXXXXX`)
3. Add to `_config.yml`:
   ```yaml
   google_analytics: G-XXXXXXXXXX
   ```

---

## Tips for Great Content

### Writing Engaging Project Descriptions

1. **Start with a hook**: What problem does it solve?
2. **Show, don't just tell**: Include screenshots and demos
3. **Highlight your role**: What did YOU specifically do?
4. **Include metrics**: Performance improvements, user counts, etc.
5. **Add technical depth**: Architecture decisions, challenges overcome

### Optimizing Images

- Use WebP format when possible (smaller file sizes)
- Keep images under 200KB for fast loading
- Use descriptive alt text for accessibility
- Consider using a CDN for external images

### Markdown Best Practices

```markdown
# Use clear headings (H1 for title, H2 for sections)

## Section Title

- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)

**Bold** for emphasis
*Italic* for subtle emphasis
`code` for inline code

```python
# Code blocks for longer code
print("Hello, World!")
```

> Blockquotes for important notes or quotes

[Links](https://example.com) should be descriptive
```

---

## License

This project is open source and available for personal use.

---

## Credits

This Jekyll portfolio theme was created based on a clean, modern design with:
- Apple-style glassmorphism navigation
- Responsive grid layouts
- GitHub activity integration
- Social media icons
- SEO optimization

Built with ❤️ using [Jekyll](https://jekyllrb.com/)
