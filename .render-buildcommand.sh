#!/bin/bash

# Install dependencies with sudo
sudo mkdir -p /var/lib/apt/lists/partial
sudo apt-get update || true
sudo apt-get install -y chromium-browser

# Install pnpm and turbo globally
sudo npm install -g pnpm turbo

# Install project dependencies without frozen lockfile
pnpm install --no-frozen-lockfile

# Build the project
pnpm build