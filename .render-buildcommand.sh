#!/bin/bash

# Install pnpm and turbo
npm install -g pnpm turbo

# Create Chrome directory
mkdir -p /tmp/chrome
cd /tmp/chrome

# Download and install Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -x google-chrome-stable_current_amd64.deb chrome

# Install project dependencies
cd /opt/render/project/src
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true pnpm install --no-frozen-lockfile

# Build the project
pnpm build