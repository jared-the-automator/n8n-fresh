#!/bin/bash

# Install Chromium browser
apt-get update || true
apt-get install -y chromium-browser

# Install pnpm and turbo
npm install -g pnpm turbo

# Install project dependencies without frozen lockfile
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true pnpm install --no-frozen-lockfile

# Build the project
pnpm build