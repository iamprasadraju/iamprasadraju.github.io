#!/usr/bin/env ruby
# frozen_string_literal: true

# Sync project descriptions and README content from GitHub into _projects/*.md.
# Runs weekly from .github/workflows/sync-projects.yml; safe to run locally.
#
# Usage: ruby scripts/sync_projects.rb
# Env:   GITHUB_TOKEN (optional locally, recommended in CI)

require "json"
require "net/http"
require "uri"

ROOT = File.expand_path("..", __dir__)
PROJECTS_DIR = File.join(ROOT, "_projects")
API_BASE = "https://api.github.com"

def github_headers
  headers = {
    "Accept" => "application/vnd.github+json",
    "User-Agent" => "portfolio-project-sync",
    "X-GitHub-Api-Version" => "2022-11-28"
  }
  token = ENV["GITHUB_TOKEN"]
  headers["Authorization"] = "Bearer #{token}" if token && !token.empty?
  headers
end

def get(url, accept: "application/vnd.github+json")
  uri = URI(url)
  request = Net::HTTP::Get.new(uri)
  github_headers.merge("Accept" => accept).each { |key, value| request[key] = value }

  Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
    http.request(request)
  end
end

def parse_repo(field)
  return nil if field.nil? || field.empty?

  match = field.match(%r{github\.com/([^/]+)/([^/#?]+)}) || field.match(%r{\A([^/]+)/([^/#?]+)\z})
  return nil unless match

  [match[1], match[2].sub(/\.git\z/, "")]
end

def rewrite_url(path, owner, repo, kind)
  return path if path.empty? || path.start_with?("#", "mailto:", "data:")
  return path if path.match?(%r{\A(?:https?:)?//})

  clean = path.sub(%r{\A\./}, "").sub(%r{\A/}, "")
  base =
    if kind == :image
      "https://raw.githubusercontent.com/#{owner}/#{repo}/HEAD/"
    else
      "https://github.com/#{owner}/#{repo}/blob/HEAD/"
    end
  "#{base}#{clean}"
end

def rewrite_relative_urls(markdown, owner, repo)
  segments = markdown.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`|<pre[\s\S]*?<\/pre>)/)

  segments.map.with_index do |segment, index|
    next segment if index.odd?

    segment = segment.gsub(/(!\[[^\]]*\]\()([^)\s]+)(\))/) do
      prefix = Regexp.last_match(1)
      path = Regexp.last_match(2)
      suffix = Regexp.last_match(3)
      "#{prefix}#{rewrite_url(path, owner, repo, :image)}#{suffix}"
    end

    segment = segment.gsub(/(\[[^\]]+\]\()([^)\s]+)(\))/) do
      prefix = Regexp.last_match(1)
      path = Regexp.last_match(2)
      suffix = Regexp.last_match(3)
      "#{prefix}#{rewrite_url(path, owner, repo, :link)}#{suffix}"
    end

    segment = segment.gsub(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/i) do
      prefix = Regexp.last_match(1)
      path = Regexp.last_match(2)
      suffix = Regexp.last_match(3)
      "#{prefix}#{rewrite_url(path, owner, repo, :image)}#{suffix}"
    end

    segment = segment.gsub(/(<source\b[^>]*\bsrcset=["'])([^"']+)(["'])/i) do
      prefix = Regexp.last_match(1)
      value = Regexp.last_match(2)
      suffix = Regexp.last_match(3)
      sources = value.split(",").map do |candidate|
        url, descriptor = candidate.strip.split(/\s+/, 2)
        rewritten = rewrite_url(url, owner, repo, :image)
        descriptor ? "#{rewritten} #{descriptor}" : rewritten
      end
      "#{prefix}#{sources.join(', ')}#{suffix}"
    end

    segment.gsub(/(<a\b[^>]*\bhref=["'])([^"']+)(["'])/i) do
      prefix = Regexp.last_match(1)
      path = Regexp.last_match(2)
      suffix = Regexp.last_match(3)
      "#{prefix}#{rewrite_url(path, owner, repo, :link)}#{suffix}"
    end
  end.join
end

def strip_github_alerts(markdown)
  markdown.gsub(/^>\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$\n?/i, "")
end

def normalize_readme(markdown)
  markdown
    .gsub(/\r\n?/, "\n")
    .gsub(/(<img\b[^>]*?["'])\s*,\s*/, '\1 ')
end

def enable_inner_markdown(markdown)
  markdown.gsub(/<(div|details|section|article|aside)\b([^>]*)>/i) do
    tag = Regexp.last_match(1)
    attrs = Regexp.last_match(2)
    attrs.match?(/\bmarkdown\s*=/i) ? "<#{tag}#{attrs}>" : "<#{tag}#{attrs} markdown=\"1\">"
  end
end

def yaml_quote(value)
  value.to_s.to_json
end

def sync_project(path)
  raw = File.read(path)
  match = raw.match(/\A(---\n)(.*?)(\n---\n)(.*)\z/m)
  unless match
    warn "  ! skipping #{File.basename(path)} (no front matter)"
    return false
  end

  front = match[2]
  body = match[4]

  repo_field = front[/^repo:\s*(.+)$/, 1]&.strip&.gsub(/\A["']|["']\z/, "")
  parsed = parse_repo(repo_field)
  unless parsed
    puts "  - skipping #{File.basename(path)} (no repo)"
    return false
  end
  owner, repo = parsed

  response = get("#{API_BASE}/repos/#{owner}/#{repo}")
  unless response.is_a?(Net::HTTPSuccess)
    warn "  ! #{owner}/#{repo}: API #{response.code} #{response.message}"
    return false
  end

  metadata = JSON.parse(response.body.force_encoding(Encoding::UTF_8))
  description = metadata["description"]&.strip

  readme_response = get("#{API_BASE}/repos/#{owner}/#{repo}/readme", accept: "application/vnd.github.raw")
  readme = readme_response.is_a?(Net::HTTPSuccess) ? readme_response.body.force_encoding(Encoding::UTF_8).scrub.strip : nil
  warn "  - #{owner}/#{repo}: README unavailable (#{readme_response.code})" unless readme

  changed = false

  if description && !description.empty?
    new_line = "description: #{yaml_quote(description)}"
    updated_front =
      if front.match?(/^description:.*$/)
        front.sub(/^description:.*$/, new_line)
      else
        with_title = front.sub(/^(title:.*)$/, "\\1\n#{new_line}")
        with_title == front ? "#{front}\n#{new_line}" : with_title
      end

    if updated_front != front
      front = updated_front
      changed = true
    end
  end

  if readme && !readme.empty?
    cleaned = enable_inner_markdown(normalize_readme(strip_github_alerts(readme)))
    new_body = "\n#{rewrite_relative_urls(cleaned, owner, repo)}\n"
    if body != new_body
      body = new_body
      changed = true
    end
  end

  if changed
    File.write(path, "#{match[1]}#{front}#{match[3]}#{body}")
    puts "  ✓ #{owner}/#{repo} -> #{File.basename(path)}"
    true
  else
    puts "  = #{owner}/#{repo} (up to date)"
    false
  end
rescue StandardError => e
  warn "  ! #{File.basename(path)}: #{e.class}: #{e.message}"
  false
end

files = Dir.glob(File.join(PROJECTS_DIR, "*.md")).sort
if files.empty?
  puts "No project files found in #{PROJECTS_DIR}"
  exit 0
end

puts "Syncing #{files.size} project(s) from GitHub..."
changed = files.count { |file| sync_project(file) }
puts "Done. #{changed} file(s) updated."
