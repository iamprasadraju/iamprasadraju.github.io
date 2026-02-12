---
title: "Docker Best Practices"
date: "Dec 2024"
summary: "A collection of best practices for writing efficient Dockerfiles and managing containers in production environments."
url: "https://example.com/notes/docker"
tags:
  - "DevOps"
  - "Docker"
  - "Containers"
---

## Dockerfile Best Practices

### 1. Use Multi-Stage Builds

```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```

### 2. Minimize Layers

Combine RUN commands:
```dockerfile
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*
```

### 3. Use .dockerignore

```
node_modules
.git
.env
*.md
```
