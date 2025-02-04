#!/bin/bash

# Install pnpm and turbo
npm install -g pnpm turbo

# Install project dependencies and let Puppeteer download its Chrome
pnpm install --no-frozen-lockfile

# Build the project
pnpm build