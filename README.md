# Minima Demo Site (with Dynamic Theme Switcher)

This is a customized Jekyll site built on top of the powerful [Minima](https://github.com/jekyll/minima) theme. It extends standard Minima with a fully functional, dynamic skin switcher UI located in the footer, which persists user string choices with `localStorage`.

It relies directly on the `master` branch of Minima to access bleeding-edge features (like built-in skins), rather than using older frozen versions on RubyGems or the `jekyll-remote-theme` plugin.

## 🚀 Setup

1. **Prerequisites:** Ensure you have [Ruby](https://www.ruby-lang.org/en/documentation/installation/) and [Bundler](https://bundler.io/) installed.
2. **Install Dependencies:** Open your terminal in the project directory and run:
   ```bash
   bundle install
   ```
   *(This will download Jekyll, Minima, and the updated Jekyll-Sass-Converter to resolve styling deprecation warnings).*

## 🛠 Usage & Running Locally

To run the site locally for development:

```bash
bundle exec jekyll serve --livereload
```

- Your site will typically be available at: [http://localhost:4000/minima/](http://localhost:4000/minima/) *(Depending on the `baseurl` inside your config)*.
- The `--livereload` flag ensures your browser seamlessly refreshes any time you make changes to your files.

### The Theme Switcher
This site dynamically generates styles for multiple variants of Minima (Classic, Dark, Auto, Solarized, etc.). There is a custom UI injected into the sub-footer where you (or visitors) can toggle the site's aesthetic seamlessly.
- **_plugins/skin_manager.rb**: A custom Ruby plugin that generates a CSS file for every available Minima skin.
- **_includes/sub-footer.html**: Contains the frontend layout and JavaScript logic to hot-swap stylesheets without refreshing and remembers user preferences via `localStorage`.

## 🎨 Customizing

There are several ways you can change how your site looks and behaves:

### 1. Site Metadata & Configuration
Edit `_config.yml` to change the fundamental aspects of your site:
- Site `title` and author details
- `email` and `social_links` (which populate the footer icons natively)
- `baseurl` (Change this to `""` if you are hosting at the root of your domain)

### 2. Custom SASS / CSS
If you need to add custom styling rules (beyond what the Minima skins provide):
- Open `_sass/minima/custom-styles.scss`.
- Add your custom CSS here. This file is currently used to construct the custom design of the theme-switcher dropdown, but you can append any sitewide rules here!

### 3. Adding Content
- **Pages**: You can edit `about.md` and `index.md` directly in the root directory. Add `.md` files with frontmatter layout keys (e.g., `layout: page`) to generate more standalone pages.
- **Posts**: Write blog posts in the `_posts` directory in the naming format `YYYY-MM-DD-title-of-post.md`.

### 4. Overriding Defaults
To override default HTML from the base Minima theme without editing the gem directly:
- Create corresponding files like `_layouts/default.html` or `_includes/header.html` in your repository. Jekyll will prioritize your local structural files over the theme defaults.
