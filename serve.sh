#!/usr/bin/env bash
set -e

# Navigate to the repository root directory
cd "$(dirname "$0")"

# Check if Bundler is installed
if ! command -v bundle &> /dev/null; then
    echo "Error: 'bundle' command not found. Please install Bundler: gem install bundler" >&2
    exit 1
fi

# Check if dependencies are installed
if ! bundle check > /dev/null 2>&1; then
    echo "Installing Ruby dependencies..."
    bundle install
fi

echo "Starting Jekyll local server..."
echo "Local URL: http://localhost:4000"
echo "Press Ctrl+C to stop the server."
echo ""

# Run Jekyll with live reloading for automatic browser refresh on changes
bundle exec jekyll serve --livereload "$@"
