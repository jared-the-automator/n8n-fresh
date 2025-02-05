#!/bin/bash
npm install
cd packages/nodes-base && npm install && npm run build
cd ../editor-ui && npm install && npm run build
