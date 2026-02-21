#!/usr/bin/env ruby
# frozen_string_literal: true

# Update modified_date in front matter based on git history
# Usage: ruby update_modified_dates.rb [file1.md file2.md ...]
# If no files given, processes all .md files in collections

require 'date'

COLLECTIONS = %w[_projects _notes].freeze

def get_git_last_modified_date(filepath)
  # Get the last commit date for this file from git
  cmd = "git log -1 --format='%ci' -- #{filepath}"
  result = `#{cmd} 2>/dev/null`.strip
  return nil if result.empty?

  # Parse git date format: "2024-02-21 15:30:00 +0000"
  DateTime.parse(result).to_date.to_s
rescue StandardError => e
  warn "Error getting git date for #{filepath}: #{e.message}"
  nil
end

def update_front_matter_date(filepath, new_date)
  content = File.read(filepath)
  
  # Check if file has front matter
  return false unless content.start_with?('---')
  
  # Find front matter end
  fm_end = content.index('---', 3)
  return false unless fm_end
  
  front_matter = content[0..fm_end + 2]
  body = content[fm_end + 3..]
  
  today = Date.today.to_s
  
  # Check if modified_date already exists
  if front_matter.include?('modified_date:')
    # Update existing modified_date
    updated_fm = front_matter.gsub(/modified_date:\s*\d{4}-\d{2}-\d{2}/, "modified_date: #{today}")
  else
    # Add modified_date after date field (or at start of front matter)
    if front_matter.include?('date:')
      updated_fm = front_matter.gsub(/(date:\s*\d{4}-\d{2}-\d{2})/, "\\1\nmodified_date: #{today}")
    else
      # Add after first --- line
      updated_fm = front_matter.sub('---', "---\nmodified_date: #{today}")
    end
  end
  
  # Write updated content
  File.write(filepath, updated_fm + body)
  true
rescue StandardError => e
  warn "Error updating #{filepath}: #{e.message}"
  false
end

def process_file(filepath)
  return unless File.exist?(filepath) && filepath.end_with?('.md')
  
  today = Date.today.to_s
  if update_front_matter_date(filepath, today)
    puts "Updated: #{filepath} -> modified_date: #{today}"
    return true
  end
  false
end

def process_staged_files
  # Get staged .md files
  cmd = "git diff --cached --name-only --diff-filter=ACM"
  staged_files = `#{cmd}`.strip.split("\n")
  
  # Filter for markdown files in collections
  md_files = staged_files.select do |f|
    f.end_with?('.md') && COLLECTIONS.any? { |c| f.start_with?(c) }
  end
  
  return if md_files.empty?
  
  puts "Updating modified_date for #{md_files.size} file(s)..."
  
  updated = 0
  md_files.each do |filepath|
    updated += 1 if process_file(filepath)
  end
  
  if updated > 0
    # Re-stage the updated files
    md_files.each do |filepath|
      system("git add #{filepath}")
    end
    puts "Re-staged #{updated} file(s) with updated dates"
  end
end

def process_all_files
  md_files = []
  COLLECTIONS.each do |collection|
    Dir.glob("#{collection}/**/*.md").each { |f| md_files << f }
  end
  
  return if md_files.empty?
  
  puts "Processing #{md_files.size} markdown file(s)..."
  
  updated = 0
  md_files.each do |filepath|
    git_date = get_git_last_modified_date(filepath)
    next unless git_date
    
    if update_front_matter_date(filepath, git_date)
      puts "Updated: #{filepath} -> #{git_date}"
      updated += 1
    end
  end
  
  puts "\nDone! Updated #{updated} file(s)"
end

# Main execution
if ARGV.empty?
  # No arguments: process all files (for initial setup)
  process_all_files
elsif ARGV.include?('--staged')
  # Called from pre-commit hook: process staged files only
  process_staged_files
else
  # Arguments provided: process specific files
  ARGV.each { |f| process_file(f) }
end
