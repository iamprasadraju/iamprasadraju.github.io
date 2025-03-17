import json
from datetime import datetime, timezone
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, TemplateNotFound

# Load JSON data from file
try:
    with Path("portfolio.json").open(encoding="utf-8") as f:
        data = json.load(f)
except FileNotFoundError:
    raise Exception("portfolio.json not found!")

# Add additional context
data["current_year"] = datetime.now(tz=timezone.utc).year

# (Optional) Normalize keys if needed
if "Certifications and Courses" in data:
    data["certifications_and_courses"] = data.pop("Certifications and Courses")
if "Blogs" in data:
    data["blogs"] = data.pop("Blogs")

# Load SVG data for social links if available
if "social_links" in data:
    for link in data["social_links"]:
        svg_path = link.get("svg_path")
        if svg_path:
            path = Path(svg_path)
            if path.exists():
                with path.open(encoding="utf-8") as svg_file:
                    link["svg_data"] = svg_file.read()
            else:
                link["svg_data"] = ""

# Set up Jinja2 environment
env = Environment(loader=FileSystemLoader("."), autoescape=True)
try:
    template = env.get_template("index_template.html")
except TemplateNotFound:
    raise Exception("index_template.html not found!")

# Render the template with the JSON data
html_output = template.render(**data)

# Write the output to index.html
with Path("index.html").open("w", encoding="utf-8") as f:
    f.write(html_output)

print("HTML file generated successfully!")
