#!/bin/bash

# Skip system-level installations since we're in a container
# Install pnpm and turbo
npm install -g pnpm turbo

# Install project dependencies without frozen lockfile
pnpm install --no-frozen-lockfile

# Build the project
pnpm build