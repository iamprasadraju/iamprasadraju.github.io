#!/bin/bash

# Check if gems are installed
if ! bundle check > /dev/null 2>&1; then
    echo "Installing dependencies..."
    bundle install
fi

# Run Jekyll with dev config (no baseurl for local development)
echo "Starting Jekyll server..."
echo "Visit: http://localhost:4000"
bundle exec jekyll serve --livereload --config _config.yml,_config_dev.yml "$@"
