# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.17.1

FROM node:${NODE_VERSION}-buster-slim

# Install essential dependencies and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    xfonts-75dpi \
    xfonts-base \
    fontconfig \
    libxrender1 \
    libxext6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install the wkhtmltopdf .deb package
RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb \
    && apt-get update \
    && apt-get install -y ./wkhtmltox_0.12.6-1.buster_amd64.deb || (cat /var/log/apt/term.log && exit 1) \
    && rm -f wkhtmltox_0.12.6-1.buster_amd64.deb

# Set environment to production by default
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user
USER node

# Copy the rest of the source files
COPY . .

# Expose the application port
EXPOSE 3004

# Run the application
CMD ["node", "server.js"]
