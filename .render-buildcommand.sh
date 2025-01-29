#!/bin/bash
mkdir -p /data/.n8n
chmod -R 777 /data
pnpm install
pnpm build
